import React, { useState } from 'react';
import PdfAnnotateContainer from 'src/components/organisms/PdfAnnotate/PdfAnnotateContainer';
import StringsArray from 'src/components/atoms/StringsArray/StringsArray';
import { isValidPdfOperation } from 'src/redux/utils/routes';
import { Popover, PopoverBody } from 'reactstrap';

export const PdfTransformer = (props) => {
  const [pdf, setPdf] = useState(null);
  const [visible, setVisible] = useState(false);

  const onHandleChange = (ops: string[]) => {
    props.onChange(ops);
    const allValid = ops.every(op => isValidPdfOperation(op));
    setVisible(!allValid);
  };

  return (
    <>
      <PdfAnnotateContainer
        getPdf={() => pdf}
        getRects={() => props.operations}
        setPdf={(value: string) => setPdf(value)}
        setRects={(rects) => {
          props.onChange(rects, 'transformerConfig');
        }}
        pushRect={(value) => {
          props.onChange([value.value]);
        }}
      />
      <label className="text-muted mr-sm-2 popover-target">PDF metadata</label>
      <StringsArray
        values={props.operations}
        onChange={(ops: string[]) => onHandleChange(ops)}
        validator={operation => isValidPdfOperation(operation)}
        placeholder="100,100,100,100:1"
      />
      <Popover
        placement="top"
        isOpen={visible}
        target=".popover-target"
        toggle={() => setVisible(!visible)}
      >
        <PopoverBody>
          <p>
            You've entered invalid config&nbsp;&nbsp;
            <span onClick={() => setVisible(!visible)} className="inilne-block">
                <i className="fa fa-times btn-icon pull-right"/>
            </span>
          </p>
          <p>
            Example:
              <p><mark>100,100,100,100:1</mark></p>
              <p><mark>100,100,100,100:1,2,5</mark></p>
              <p><mark>100,100,100,100:*</mark></p>
          </p>
        </PopoverBody>
      </Popover>
    </>
  );
};
