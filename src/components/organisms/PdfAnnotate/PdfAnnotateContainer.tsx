/* global PDFJS */

import React from 'react';
import PDFJS, { PDFJSStatic, PDFDocumentProxy, PDFPageViewport } from 'pdfjs-dist';

import { Stage } from 'react-konva';
import { IRect, rectFromStr, rectToStr, rectRegex } from 'src/redux/utils/pdf-annotations.utils';
import PdfAnnotateComponent, { IStringValue } from 'src/components/organisms/PdfAnnotate/PdfAnnotateComponent';

export interface IPDFAnnotationsContainerProps {
  setRects: (value: IStringValue[]) => void;
  getRects: () => IStringValue[];
  getPdf: () => string;
  pushRect: (rect: IStringValue) => void;
  setPdf: (data: string) => void;
  onPdfLoad?: () => void | null;
  pdfPlugin?: PDFJSStatic;

}

export interface IPDFAnnotationsContainerState {
  pdfPageNumber: number;
  pdfDoc: PDFDocumentProxy | null;
  isLoaded: boolean;
  fileList: File[];
  drag: boolean;
  rect: IRect | null;
  viewport: PDFPageViewport | null;
  fromDownToUp: boolean;
}

class PdfAnnotateContainer extends React.Component<IPDFAnnotationsContainerProps, IPDFAnnotationsContainerState> {
  state: IPDFAnnotationsContainerState = {
    pdfPageNumber: 1,
    pdfDoc: null,
    isLoaded: false,
    fileList: [],
    drag: false,
    rect: null,
    viewport: null,
    fromDownToUp: false,
  };
  stage = React.createRef<Stage>();
  rect = React.createRef<any>();
  boxes: any = {};
  private canvas = React.createRef<HTMLCanvasElement>();

  changePage = (toPage?: number) => {
    const pdfDoc = this.state.pdfDoc;
    if (pdfDoc) {
      let page: number;
      if (toPage) {
        page = toPage;

      } else {
        page = this.state.pdfPageNumber;
      }
      if (page < 1) {
        page = 1;
      }
      if (page > pdfDoc.numPages) {
        page = pdfDoc.numPages;
      }
      this.loadPdfPage(page, (viewport) => {
        this.setState({ viewport, pdfPageNumber: page });

      });
    }
  }

  loadFromDataPdf = (data: any) => {
    if (!data) return;

    let pdfPlugin;
    if (this.props.pdfPlugin) {
      pdfPlugin = this.props.pdfPlugin;
    } else {
      pdfPlugin = PDFJS;
    }
    pdfPlugin.getDocument(data).then(
      (_pdfDoc) => {
        this.setState({ pdfDoc: _pdfDoc });
        this.loadPdfPage(1, () => {
          this.setState({ pdfPageNumber: 1, isLoaded: true });
          if (this.props.onPdfLoad) {
            this.props.onPdfLoad();
          }
        });
      });
  }

  loadPdfPage = (pageNumber: number, callback?: (viewport: PDFPageViewport) => void) => {
    const pdfDoc = this.state.pdfDoc;
    if (pdfDoc) {
      pdfDoc.getPage(pageNumber).then((page) => {
        const viewport = page.getViewport(1);
        this.setState({ viewport });
        const canvas = this.canvas.current;
        if (canvas) {
          const context = canvas.getContext('2d');
          if (context) {
            const renderContext = {
              viewport,
              canvasContext: context,
            };
            page.render(renderContext).then(() => {
              if (callback) {
                callback(viewport);
              }
            });
          }
        }
      });
    }
  }

  fileDrop = (files: File[]) => {
    this.setState({ isLoaded: false, fileList: files }); // FileList object.
    const reader = new FileReader();

    reader.addEventListener(
      'load',
      () => {
        this.props.setPdf(reader.result);
        this.loadFromDataPdf({
          data: reader.result,
        });
      },
      false);
    reader.readAsBinaryString(files[0]);
  }

  removeRect = (x: number, y: number) => {
    const rectsToRemove = this.props.getRects().filter(
      (r: { value: string }): boolean => {
        return this.isRectContains(r, x, y) || rectRegex.exec(r.value) === null;
      });
    const annotations = this.props.getRects().filter((r): boolean => {
      return !rectsToRemove.includes(r);
    });
    this.props.setRects(annotations);
    this.setState({ drag: false, rect: null });

  }

  isRectContains = (r: { value: string }, x: number, y: number) => {
    if (x === 0 && y === 0) return false;
    const viewport = this.state.viewport;
    const docHeight = viewport ? viewport.height : 0;

    const localRect = rectFromStr(r.value, docHeight);
    return localRect.page === (this.state.pdfPageNumber) &&
      localRect.startX <= x && x <= localRect.startX + localRect.width &&
      localRect.startY <= y && y <= localRect.startY + localRect.height;
  }

  addRect = (rect: IRect, fromDownToUp: boolean) => {
    const viewport = this.state.viewport;
    const docHeight = viewport ? viewport.height : 0;

    let [x, y] = [Math.round(rect.startX), Math.round(docHeight - rect.startY)];

    if (rect.width < 0) {
      rect.width = Math.abs(rect.width);
      x = (x || 0) - rect.width;
    }
    if (rect.height < 0) {
      rect.height = Math.abs(rect.height);
      y = (y || 0) - rect.height;
    }

    rect.page = this.state.pdfPageNumber;
    rect.startX = x;
    rect.startY = fromDownToUp ? y + rect.height : y - rect.height;

    if (rect.height && rect.width && x && y) {
      this.props.pushRect({
        value: rectToStr(rect),
      });
    }
  }

  DrawAreaMouseDown = (x: number, y: number) => {
    this.setState({
      drag: true,
      rect: {
        height: 0,
        width: 0,
        page: this.state.pdfPageNumber,
        startX: x,
        startY: y,
      },
    });
  }

  DrawAreaMouseUp = () => {
    if (this.state.drag && this.state.rect) {
      this.addRect(this.state.rect, this.state.fromDownToUp);
      this.setState({ drag: false, rect: null });
    }
  }

  DrawAreaMouseMove = (x: number, y: number) => {
    if (this.state.drag && this.state.rect) {
      const fromDownToUp = this.state.rect.startY > y;
      this.setState({
        fromDownToUp,
        rect: {
          ...this.state.rect,
          width: x - this.state.rect.startX,
          height: y - this.state.rect.startY,
        },
      });
    }
  }

  rectListRef = (name: string, node: any) => {
    this.boxes[name] = node;
  }

  componentDidMount() {
    const pdf = this.props.getPdf();

    if (pdf) {
      this.loadFromDataPdf({
        data: pdf,
      });
    }
  }

  render() {
    return (
      <PdfAnnotateComponent
        fileList={this.state.fileList}
        isLoaded={this.state.isLoaded}
        pdfNumPages={this.state.pdfDoc ? this.state.pdfDoc.numPages : 0}
        pdfPageNumber={this.state.pdfPageNumber}
        stageRef={this.stage}
        canvasRef={this.canvas}
        viewport={this.state.viewport}
        canvasRectIndicatorRef={this.rect}
        rectIndicator={this.state.rect}
        onChangePage={this.changePage}
        rects={this.props.getRects()}
        onFileDrop={this.fileDrop}
        rectListRef={this.rectListRef}
        onRemoveRect={this.removeRect}
        onDrawAreaMouseMove={this.DrawAreaMouseMove}
        onDrawAreaMouseDown={this.DrawAreaMouseDown}
        onDrawAreaMouseUp={this.DrawAreaMouseUp}
        setPdfPageNumber={(page: number) => {
          this.setState({ pdfPageNumber: page });
        }}
      />
    );
  }
}

export default PdfAnnotateContainer;
