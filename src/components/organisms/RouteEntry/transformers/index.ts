export * from './JsonPath';
export * from './FormData';
export * from './XPath';
export * from './RegExpTransformer';
export * from './HtmlTransformer';
export * from './PdfTransformer';
export * from './Csv';

export interface ITransformerProps {
  operations: string[];
  operationsMap: any;
  onChange: (values: string[], key: string, isRegExp: boolean) => void;
  isExperimentsVisible?: boolean;
}

export interface ITransformerState {
  popoverOpen: boolean;
}
