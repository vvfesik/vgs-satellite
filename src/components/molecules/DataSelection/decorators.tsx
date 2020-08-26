import React from 'react';

const Loading = ({ style }) => {
  return (
    <div style={style}>
      loading...
    </div>
  );
};

const Toggle = ({ style }) => {
  const { height, width } = style;
  const midHeight = height * 0.5;
  const points = `0,0 0,${height} ${width},${midHeight}`;

  return (
    <div style={style.base}>
      <div style={style.wrapper}>
        <svg height={height} width={width}>
          <polygon
            points={points}
            style={style.arrow}
          />
        </svg>
      </div>
    </div>
  );
};

const Header = ({ style, node }) => {
  return (
    <div style={style.base} title={node.path} data-role="checkbox-text" className={'w-95 text-word-break'}>
      {node.name}
    </div>
  );
};

const Container = ({ node, style, terminal, onClick, decorators }) => {
  if (!node.operation) node.operation = 'reveal';

  return (
    <div onClick={() => { node.op = 123; onClick(); }}>
      {terminal ?
        <input
          name="isGoing"
          type="checkbox"
          readOnly
          checked={node.selected}
        />
      : null}
      {!terminal ? <decorators.Toggle style={style.toggle} /> : null}
      <decorators.Header style={style.header} node={node} />
    </div>
  );
};

export default {
  Loading,
  Toggle,
  Header,
  Container,
};
