const baseStyles = {
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

export const singleValueStyles = {
  ...baseStyles,
  marker: {
    display: 'none',
  },
  diffRemoved: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
};

export const styles = {
  ...baseStyles,
  variables: {
    removedBackground: 'rgba(239, 121, 138, 0.2) !important',
    wordRemovedBackground: 'rgba(239, 121, 138, 0.2) !important',
    addedBackground: 'rgba(47, 194, 159, 0.2) !important',
    wordAddedBackground: 'rgba(47, 194, 159, 0.2) !important',
  },
  marker: {
    width: '1em',
    padding: '0',
  },
};
