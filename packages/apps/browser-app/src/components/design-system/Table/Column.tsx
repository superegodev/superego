import type { ReactNode, RefAttributes } from "react";
import { type ColumnProps, Column as ColumnRAC } from "react-aria-components";
import { PiSortAscending, PiSortDescending } from "react-icons/pi";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Table.css.js";

interface Props extends ColumnProps {
  align?: "left" | "center" | "right" | undefined;
  children: ReactNode;
  className?: string | undefined;
}
export default function Column({
  align = "left",
  className,
  children,
  ...props
}: Props & RefAttributes<HTMLDivElement | HTMLTableCellElement>) {
  return (
    <ColumnRAC {...props} className={classnames(cs.Column.root, className)}>
      {({ sortDirection, allowsSorting }) => (
        <>
          <span className={cs.Column.title[align]}>{children}</span>
          {allowsSorting && sortDirection ? (
            <span className={cs.Column.sortIndicator}>
              {sortDirection === "ascending" ? (
                // The phosphoricons are for some reason switched around:
                // ascending points down, and descending points up. There might
                // be a logic behind it, but it just looks backwards to me, so
                // here we use them in the other way.
                <PiSortDescending />
              ) : (
                <PiSortAscending />
              )}
            </span>
          ) : null}
        </>
      )}
    </ColumnRAC>
  );
}
