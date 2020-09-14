import React, { useRef } from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { IRect, rectFromStr } from 'src/redux/utils/pdf-annotations.utils';
import { KonvaEventObject } from 'konva';
import { PDFPageViewport } from 'pdfjs-dist';
import { Icon } from 'src/components/antd';

export interface IStringValue {
  value: string;
}

export interface IPdfAnnotateProps {
  fileList: File[];
  isLoaded: boolean;
  pdfPageNumber: number;
  rectIndicator: IRect | null;
  pdfNumPages: number;
  rects: IStringValue[];
  onFileDrop: (files: File[]) => void;
  viewport: PDFPageViewport | null;
  stageRef: React.RefObject<Stage>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasRectIndicatorRef: React.RefObject<any>;
  onChangePage: (toPage?: number) => void;
  setPdfPageNumber: (page: number) => void;
  rectListRef: (name: string, node: any) => void;
  onRemoveRect: (x: number, y: number) => void;
  onDrawAreaMouseMove: (x: number, y: number) => void;
  onDrawAreaMouseDown: (x: number, y: number) => void;
  onDrawAreaMouseUp: () => void;
}

const PdfAnnotateComponent: React.SFC<IPdfAnnotateProps> = (props) => {
  const {
    onFileDrop,
    fileList,
    isLoaded,
    pdfPageNumber,
    pdfNumPages,
    viewport,
    canvasRef,
    stageRef,
    onChangePage,
    canvasRectIndicatorRef,
    rectIndicator,
    rects,
    onRemoveRect,
    onDrawAreaMouseMove,
    onDrawAreaMouseDown,
    onDrawAreaMouseUp,
    rectListRef,
    setPdfPageNumber,
  } = props;

  const pdfTotalPages = `of ${pdfNumPages || 0}`;
  const inputFile = useRef(null);

  const onInputFile = () => {
    // `current` points to the mounted file input element
    inputFile.current.click();
  };

  const readFile = (e) => {
    if (e.target.files.length > 0) {
      onFileDrop(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <label className="text-muted">Configuration</label>
      <div
        onDragOver={(evt: React.DragEvent<HTMLDivElement>) => {
          evt.stopPropagation();
          evt.preventDefault();
          evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        }}
        onDrop={(evt: React.DragEvent<HTMLDivElement>) => {
          evt.stopPropagation();
          evt.preventDefault();
          onFileDrop(Array.from(evt.dataTransfer.files));
        }}
        onClick={onInputFile}
        className="drop_zone ant-upload ant-upload-drag"
      >
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
      </div>
      <input
        type="file"
        ref={inputFile}
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={e => readFile(e)}
      />
      <ul>
        {fileList.map((f) => {
          return (
            <li key={f.name}>
              <strong>{f.name}</strong> ({f.type || 'n/a'}) - {f.size} bytes, last
              modified: {new Date(f.lastModified).toLocaleDateString()}
            </li>
          );
        })}
      </ul>
      <div
        className="pdf-navigator"
        style={{
          display: isLoaded ? 'flex' : 'none',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div className="input-group" style={{ width: 280 }}>
          <input
            type="number"
            min="1"
            className="form-control"
            value={pdfPageNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPdfPageNumber(parseInt(e.target.value, 10) || 1);
            }}
            onKeyPress={(e: React.KeyboardEvent<any>) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onChangePage();
              }
            }}
            onBlur={() => {
              onChangePage();
            }}
          />
          <input
            type="text"
            value={pdfTotalPages}
            className="form-control"
            readOnly={true}
            disabled={true}
          />
          <div role="group" className="input-group-append btn-group">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onChangePage(pdfPageNumber - 1);
              }}
            >
              <i className="fas fa-arrow-left"/>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onChangePage(pdfPageNumber + 1);
              }}
            >
              <i className="fas fa-arrow-right"/>
            </button>
          </div>
        </div>

      </div>
      <div
        className="pdf-holder"
        style={{
          justifyContent: 'center',
          width: '100%',
          display: isLoaded ? 'flex' : 'none',
        }}
      >
        <div style={{ position: 'relative' }}>
          <canvas
            width={viewport ? viewport.width : 0}
            height={viewport ? viewport.height : 0}
            ref={canvasRef}
          />
          <Stage
            ref={stageRef}
            className={'draw_area'}
            style={{ position: 'absolute', top: 0, left: 0, border: '1px solid' }}
            width={viewport ? viewport.width : 0}
            height={viewport ? viewport.height : 0}
            onMouseMove={(e: KonvaEventObject<PointerEvent>) => {
              const targetRect = e.currentTarget.getContent().getBoundingClientRect();
              const x = (e.evt.pageX - (window.pageXOffset + targetRect.left));
              const y = (e.evt.pageY - (window.pageYOffset + targetRect.top));
              onDrawAreaMouseMove(x, y);
            }}
            onMouseDown={(e: KonvaEventObject<PointerEvent>) => {
              const LEFT_CLICK = 0;
              const targetRect = e.currentTarget.getContent().getBoundingClientRect();
              switch (e.evt.button) {
                case LEFT_CLICK:
                  const y = e.evt.pageY - (window.pageYOffset + targetRect.top);
                  const x = e.evt.pageX - (window.pageXOffset + targetRect.left);
                  onDrawAreaMouseDown(x, y);
                  break;
              }
            }
            }
            onMouseUp={onDrawAreaMouseUp}
            onContextMenu={(e: KonvaEventObject<PointerEvent>) => {
              e.evt.preventDefault();
              return false;
            }}
          >
            <Layer>
              {rects.map((r) => {
                const docHeight = props.viewport ? props.viewport.height : 0;
                const localRect = rectFromStr(r);

                localRect.startY = docHeight - localRect.startY - localRect.height;
                if (localRect.page !== pdfPageNumber) {
                  return null;
                }

                return (
                  <Rect
                    ref={(node) => {
                      rectListRef(r.value, node);
                    }}
                    key={r.value}
                    x={localRect.startX}
                    y={localRect.startY}
                    width={localRect.width}
                    height={localRect.height}
                    fill="black"
                    onContextMenu={(e: KonvaEventObject<PointerEvent>) => {
                      onRemoveRect(localRect.startX, localRect.startY);
                      e.evt.preventDefault();
                    }}
                  />
                );
              })}
              {rectIndicator ?
                <Rect
                  ref={canvasRectIndicatorRef}
                  x={rectIndicator.startX}
                  y={rectIndicator.startY}
                  width={rectIndicator.width}
                  height={rectIndicator.height}
                  stroke="red"
                /> : null}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

export default PdfAnnotateComponent;
