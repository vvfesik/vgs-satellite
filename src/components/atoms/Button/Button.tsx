import React, { FC } from 'react';
import { Button as AntdButton } from 'antd';

import { BaseButtonProps } from 'antd/lib/button/button';

export interface IButtonProps extends BaseButtonProps {
  /** Color of button.
   *
   * @default primary
   */
  color?: 'primary' | 'secondary' | 'dark' | 'accent';
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Redirect url of link button. */
  href?: string;
  /** Same as target attribute of a, works when href is specified. */
  target?: string;
  /** To disable button */
  disabled?: boolean;
  htmlType?: string;
}

const Button: FC<IButtonProps> = (props) => {

  const { color, size, type = 'primary', ...rest } = props;
  const sizeType = () => {
    if (!size) return 'default';
    if (['sm', 'small'].includes(size)) return 'small';
    if (['lg', 'large'].includes(size)) return 'large';
    return 'default';
  };

  const btnType = () => {
    if (!color) return type;
    return color === 'accent'
      ? 'secondary'
      : color;
  };
  return (
    <AntdButton
      {...rest}
      // @ts-ignore
      type={btnType()}
      size={sizeType()}
    />
  );
};

export default Button;
