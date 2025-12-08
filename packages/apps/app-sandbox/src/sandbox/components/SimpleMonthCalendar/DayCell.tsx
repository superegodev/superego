import type { CalendarDate } from "@internationalized/date";
import { cloneElement, type JSX, type ReactNode, useRef } from "react";
import { CalendarCell } from "react-aria-components";
import * as cs from "./SimpleMonthCalendar.css.js";

interface Props {
  /** @internal */
  date: CalendarDate;
  /** @internal */
  onUnselectDate: () => void;
  /** @internal */
  renderDayPopover?: ((day: string) => JSX.Element) | undefined;
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    color?: string;
  };
  children: ReactNode;
}
export default function DayCell({
  date,
  onUnselectDate,
  renderDayPopover,
  style,
  children,
}: Props) {
  const calendarCellRef = useRef<HTMLTableCellElement>(null);
  return (
    <CalendarCell
      ref={calendarCellRef}
      date={date}
      style={{
        backgroundColor: style?.backgroundColor,
        borderColor: style?.borderColor,
        color: style?.color,
      }}
      className={cs.DayCell.root}
    >
      {({ isSelected }) => (
        <>
          <div className={cs.DayCell.dayContainer}>
            <span className={cs.DayCell.day}>{date.day}</span>
          </div>
          <div className={cs.DayCell.content}>{children}</div>
          {isSelected && renderDayPopover
            ? cloneElement(renderDayPopover(date.toString().split("T")[0]!), {
                date: date,
                calendarCellRef: calendarCellRef,
                onClose: onUnselectDate,
              })
            : null}
        </>
      )}
    </CalendarCell>
  );
}
