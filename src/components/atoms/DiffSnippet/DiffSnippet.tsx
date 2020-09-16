import * as React from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import classnames from 'classnames';
import { styles, singleValueStyles } from './styles';

interface IDiffSnippetProps {
  oldCode: string;
  newCode: string;
  oldTitle?: string;
  newTitle?: string;
  hideLineNumbers?: boolean;
  splitView?: boolean;
  showDiffOnly?: boolean;
  extraLinesSurroundingDiff?: number;
}

const DiffSnippet: React.SFC<IDiffSnippetProps> = (props) => {
  const { oldCode, newCode, oldTitle, newTitle } = props;

  const duffStyles = !!newCode ? styles : singleValueStyles;

  return (
    <div
      className={classnames('diffsnippet', {
        splitview: props.splitView,
      })}
    >
      {oldTitle && newTitle && (
        <div className="row">
          <div className="col">
            <p className="heading pl-3 mb-2">{oldTitle}</p>
          </div>
          <div className="col">
            <p className="heading mb-2">{newTitle}</p>
          </div>
        </div>
      )}
      <ReactDiffViewer
        oldValue={oldCode}
        newValue={newCode}
        splitView={props.splitView}
        showDiffOnly={props.showDiffOnly}
        styles={duffStyles}
        hideLineNumbers={props.hideLineNumbers}
        onLineNumberClick={() => { return; }}
        extraLinesSurroundingDiff={props.extraLinesSurroundingDiff}
      />
    </div>
  );
};

export default DiffSnippet;
