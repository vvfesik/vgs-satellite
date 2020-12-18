import React from 'react';
import cn from 'classnames';
import { FormGroup, Label, Button, ButtonGroup } from 'reactstrap';
import DocsPopover from 'src/components/organisms/DocsPopover/DocsPopover';

import {
  JsonPath,
  FormData,
  XPath,
  RegExpTransformer,
  HtmlTransformer,
  PdfTransformer,
  Csv,
} from './transformers';
import { ITransformerConfigMap } from 'src/redux/interfaces/routes';

export interface ITransformersConfigProps {
  form: any;
  transformerConfig: string[];
  onChange: (value: any, key: string, isRegExp?: boolean) => void;
  changeFormTokenDecorator: (value: any) => void;
  onConfigChange: () => {};
  isCSVTransformerEnabled: boolean;
  transformerConfigMap: ITransformerConfigMap;
}

const transformersList = [{
  label: 'Json',
  name: 'JSON_PATH',
}, {
  label: 'XML',
  name: 'XPATH',
}, {
  label: 'RegExp',
  name: 'REGEX',
}, {
  label: 'Form',
  name: 'FORM_FIELD',
}, {
  label: 'HTML',
  name: 'HTML',
}, {
  label: 'PDF',
  name: 'PDF_METADATA_TOKEN',
}, {
  label: 'CSV',
  name: 'CSV',
}];

const enabledTransformers = ['JSON_PATH', 'FORM_FIELD', 'XPATH', 'REGEX']

export const TransformersConfig: React.FC<ITransformersConfigProps> = (props) => {

  const renderTransformersList = () => {
    const sftpTransformersList = props.isCSVTransformerEnabled
      ? transformersList
      : transformersList.filter(transformer => transformer.name !== 'CSV');

    return sftpTransformersList.map(transformer => (
      <Button
        key={transformer.name}
        className={cn([
          'btn-light',
          { active: props.form.transformer === transformer.name },
          { 'is-disabled': !enabledTransformers.includes(transformer.name)},
        ])}
        onClick={(e: any) => { e.preventDefault(); props.onChange(transformer.name, 'transformer', transformer.name === 'REGEX'); }}
      >
        {transformer.label}
      </Button>
    ));
  };

  const renderTransformers = () => {
    let Component;
    const transformer = props.form.transformer;
    if (transformer === 'JSON_PATH') {
      Component = JsonPath;
    } else if (transformer === 'XPATH') {
      Component = XPath;
    } else if (transformer === 'REGEX') {
      Component = RegExpTransformer;
    } else if (transformer === 'FORM_FIELD') {
      Component = FormData;
    } else if (transformer === 'PDF_METADATA_TOKEN') {
      Component = PdfTransformer;
    } else if (transformer === 'HTML') {
      Component = HtmlTransformer;
    } else if (transformer === 'CSV') {
      Component = Csv;
    } else {
      Component = () => <div>{JSON.stringify(props.transformerConfig)}</div>;
    }

    return (
      <React.Fragment>
        <Component
          operations={props.transformerConfig}
          operationsMap={props.transformerConfigMap}
          onChange={(values: string[], key: string, isRegExp: boolean) => props.onChange(values, key, isRegExp)}
        />
      </React.Fragment>
    );
  };

  return (
    <div>
      <div className="form-group row" data-role="basic-transformers-container">
        <Label className="text-muted">
          Operation <DocsPopover term="Operation" />
        </Label>
      </div>
      <div className="row">
        <ButtonGroup className="mb-4">
         {renderTransformersList()}
        </ButtonGroup>
      </div>
      <div className="form-group row">
        <FormGroup className="col-sm-12 mb-2 mr-sm-2 mb-sm-0">
          {renderTransformers()}
        </FormGroup>
      </div>
    </div>
  );
};

export default TransformersConfig;
