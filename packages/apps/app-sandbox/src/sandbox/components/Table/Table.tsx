import type { ReactNode } from "react";
import {
  TableBody,
  TableHeader,
  Table as TableRAC,
} from "react-aria-components";
import Cell from "./Cell.js";
import Column from "./Column.js";
import Row from "./Row.js";
import * as cs from "./Table.css.js";

interface Props {
  ariaLabel?: string;
  children: ReactNode;
}
export default function Table({ ariaLabel, children }: Props) {
  return (
    <TableRAC aria-label={ariaLabel} className={cs.Table.root}>
      {children}
    </TableRAC>
  );
}

Table.Body = TableBody;
Table.Cell = Cell;
Table.Column = Column;
Table.Header = TableHeader;
Table.Row = Row;
