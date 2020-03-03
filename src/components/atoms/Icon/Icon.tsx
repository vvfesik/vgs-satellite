import classnames from 'classnames';
import React from 'react';

export interface IIconProps {
  onClick?: (e: React.MouseEvent) => void;
  onMouseOver?: (e: React.MouseEvent) => void;
  onMouseOut?: (e: React.MouseEvent) => void;
  animation?: string;
  position?: string;
  name: string;
  type?: string;
  id?: string;
  regular?: boolean; // set regular type for icon
  className?: string;
}

const Icon: React.SFC<IIconProps> = (props) => {

  const className = () => {
    return classnames(
      `fa-${props.name}`,
      {
        fas: !props.regular,
        far: props.regular,
        'mr-2': props.position === 'left',
        'ml-1': props.position === 'right',
        [`fa-${props.animation}`]: !!props.animation,
        [`text-${props.type}`]: props.type,
      },
    );
  };

  return (
    <span
      id={props.id}
      onClick={e => props.onClick && props.onClick(e)}
      onMouseOver={e => props.onMouseOver && props.onMouseOver(e)}
      onMouseOut={e => props.onMouseOut && props.onMouseOut(e)}
      className={props.className}
    >
      <i className={className()}/>
    </span>
  );
};

Icon.defaultProps = {
  id: '',
};

export default Icon;
