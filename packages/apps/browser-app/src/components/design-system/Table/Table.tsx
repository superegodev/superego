import type { RefAttributes } from "react";
import {
  TableLayout,
  type TableProps,
  Table as TableRAC,
  Virtualizer,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import Body from "./Body.js";
import Cell from "./Cell.js";
import Column from "./Column.js";
import Empty from "./Empty.js";
import Header from "./Header.js";
import Row from "./Row.js";
import * as cs from "./Table.css.js";

interface Props extends TableProps {
  className?: string | undefined;
}
export default function Table({
  className,
  ...props
}: Props & RefAttributes<HTMLTableElement>) {
  return (
    <Virtualizer
      layout={TableLayout}
      layoutOptions={{
        rowHeight: 33,
        headingHeight: 41,
        padding: 0,
        gap: 0,
      }}
    >
      <TableRAC {...props} className={classnames(cs.Table.root, className)} />
    </Virtualizer>
  );
}

Table.Body = Body;
Table.Cell = Cell;
Table.Column = Column;
Table.Header = Header;
Table.Row = Row;
Table.Empty = Empty;
