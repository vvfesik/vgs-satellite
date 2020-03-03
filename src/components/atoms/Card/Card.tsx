import React, { FC } from 'react';
import { Card as AntdCard } from 'antd';
import { CardSize, CardTabListType, CardType } from 'antd/lib/card';

import cn from 'classnames';

export interface ICardProps {
  /** Fill header with grayish color.
   *
   * @default true
   */
  headerFill?: boolean;

  prefixCls?: string;
  title?: React.ReactNode;
  extra?: React.ReactNode;
  bordered?: boolean;
  headStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  loading?: boolean;
  noHovering?: boolean;
  hoverable?: boolean;
  children?: React.ReactNode;
  id?: string;
  className?: string;
  size?: CardSize;
  type?: CardType;
  cover?: React.ReactNode;
  actions?: React.ReactNode[];
  tabList?: CardTabListType[];
  tabBarExtraContent?: React.ReactNode | null;
  onTabChange?: (key: string) => void;
  activeTabKey?: string;
  defaultActiveTabKey?: string;
}

const Card: FC<ICardProps> = (props) => {

  const { headerFill = true, className, ...rest } = props;

  return (
    <AntdCard
      {...rest}
      className={cn(
        className,
        'card',
        { headerFill },
      )}
    />
  );
};

export default Card;
