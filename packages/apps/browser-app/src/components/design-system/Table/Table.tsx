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
import { HEADING_HEIGHT, ROW_HEIGHT } from "./constants.js";
import Empty from "./Empty.js";
import Header from "./Header.js";
import Row from "./Row.js";
import * as cs from "./Table.css.js";

interface Props extends TableProps {
  className?: string | undefined;
  isEmpty?: boolean | undefined;
}
export default function Table({
  className,
  isEmpty,
  ...props
}: Props & RefAttributes<HTMLTableElement>) {
  // Virtualization causes issues with empty tables (empty state doesn't
  // render), so disable it when the table is empty.
  const table = (
    <TableRAC {...props} className={classnames(cs.Table.root, className)} />
  );
  return !isEmpty ? (
    <Virtualizer
      layout={TableLayout}
      layoutOptions={{
        headingHeight: HEADING_HEIGHT,
        rowHeight: ROW_HEIGHT,
        padding: 0,
        gap: 0,
      }}
    >
      {table}
    </Virtualizer>
  ) : (
    table
  );
}

Table.Body = Body;
Table.Cell = Cell;
Table.Column = Column;
Table.Header = Header;
Table.Row = Row;
Table.Empty = Empty;
