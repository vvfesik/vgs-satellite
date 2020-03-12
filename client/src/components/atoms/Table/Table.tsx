import React, { FC } from 'react';
import { Table as AntdTable } from 'antd';
import { TableProps } from 'antd/lib/table/interface';
import cn from 'classnames';

interface ITableProps extends TableProps<any> {
  /** Transparent background.
   *
   * @default true
   */
  headerBgTransparent?: boolean;

  /** Color of hover effect.
   *
   * @default none
   */
  type?: 'primary' | 'secondary' | 'dark' | 'text' | 'none';

  /** Makes odd rows to be with grey background.
   *
   * @default true
   */
  striped?: boolean;

  /** Disable borders for content rows.
   *
   * @default true
   */
  rowBorderNone?: boolean;

  /** Rounds borders for content rows.
   *
   * @default true
   */
  rowBorderRounded?: boolean;

  /** Disable borders for header row.
   *
   * @default true
   */
  headerBorderNone?: boolean;
}

const Table: FC<ITableProps> = (props) => {

  const {
      headerBgTransparent = true,
      type = 'none',
      striped = true,
      rowBorderNone = true,
      rowBorderRounded = true,
      headerBorderNone = true,
      ...rest
    } = props;

  return (
      <AntdTable
        {...rest}
        className={cn(
          { 'ant-table-wrapper--transparent-header': headerBgTransparent },
          { [`ant-table-row-${type}`]: !!type },
          { 'table-striped': striped },
          { 'row-border-none': rowBorderNone },
          { 'row-border-rounded': rowBorderRounded },
          { 'header-border-none': headerBorderNone },
          )}
      />
  );
};

export default Table;
