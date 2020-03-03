import * as React from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import classnames from 'classnames';

interface IDiffSnippetProps {
  oldCode: string;
  newCode: string;
  oldTitle?: string;
  newTitle?: string;
  hideLineNumbers?: boolean;
  splitView?: boolean;
  showDiffOnly?: boolean;
}

const DiffSnippet: React.SFC<IDiffSnippetProps> = (props) => {
  const { oldCode, newCode, oldTitle, newTitle } = props;

  const styles = {
    variables: {
      removedBackground: 'rgba(239, 121, 138, 0.2) !important',
      wordRemovedBackground: 'rgba(239, 121, 138, 0.2) !important',
      addedBackground: 'rgba(47, 194, 159, 0.2) !important',
      wordAddedBackground: 'rgba(47, 194, 159, 0.2) !important',
    },
    diffContainer: {
      backgroundColor: '#f7f9fc',
      color: '#3B495C',
      borderRadius: '8px',
      'tbody tr:first-child td': {
        paddingTop: '0.5em',
      },
      'tbody tr:last-child td': {
        paddingBottom: '0.5em',
      },
      pre: {
        lineHeight: 'inherit',
        fontSize: '0.85rem',
        display: 'inline',
      },
    },
    line: {
      border: 'none !important',
      '&:first-child td': {
        paddingTop: '0.5em',
      },
      '&:last-child td': {
        paddingBottom: '0.5em',
      },
      'td:nth-child(3n)': {
        paddingRight: '1em',
      },
    },
    gutter: {
      backgroundColor: 'transparent',
      color: '#83888F',
      padding: '0 10px',
      minWidth: 'initial',
      cursor: 'default',
      pointerEvents: 'none',
      '&:nth-child(2n)': {
        borderLeft: '1px solid #CED5E0',
      },
      '&:nth-child(2n-1)': {
        paddingLeft: '0.5em',
      },
      pre: {
        whiteSpace: 'nowrap',
        display: 'inline',
        lineHeight: 'initial',
      },
      width: '3em',
    },
    marker: {
      width: '1em',
      padding: '0',
    },
    wordDiff: {
      padding: '3px 0 1px',
    },
    diffRemoved: {
      backgroundColor: 'rgba(239, 121, 138, 0.2)',
    },
    diffAdded: {
      backgroundColor: 'rgba(47, 194, 159, 0.2)',
    },
    wordRemoved: {
      lineHeight: 'inherit !important',
    },
    wordAdded: {
      lineHeight: 'inherit !important',
    },
    codeFold: {
      backgroundColor: '#eff4f9',
      height: 'inherit',
      a: {
        color: 'inherit',
        opacity: '0.5',
        '&:hover': {
          opacity: '1',
        },
      },
      'td:nth-of-type(5), td:nth-of-type(6)': {
        display: 'none',
      },
      '> td:empty:not(:last-child)': {
        width: '2em',
      },
    },
    codeFoldGutter: {
      backgroundColor: 'inherit',
      width: '3em !important',
    },
    emptyLine: {
      paddingTop: '0',
      paddingBottom: '0',
    },
  };

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
        styles={styles}
        hideLineNumbers={props.hideLineNumbers}
        onLineNumberClick={() => { return; }}
      />
    </div>
  );
};

export default DiffSnippet;
