import type { ReactNode } from "react";
import { CalendarCell } from "react-aria-components";
import { useDay } from "./DayContext.js";
import * as cs from "./SimpleMonthCalendar.css.js";

interface Props {
  style?:
    | {
        backgroundColor?: string | undefined;
        borderColor?: string | undefined;
        borderStyle?: string | undefined;
        color?: string | undefined;
      }
    | undefined;
  children: ReactNode;
}
export default function DayCell({ style, children }: Props) {
  const { date, calendarCellRef, renderDayPopover } = useDay();
  return (
    <CalendarCell
      ref={calendarCellRef}
      date={date}
      style={{
        backgroundColor: style?.backgroundColor,
        borderColor: style?.borderColor,
        borderStyle: style?.borderStyle,
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
            ? renderDayPopover(date.toString().split("T")[0]!)
            : null}
        </>
      )}
    </CalendarCell>
  );
}
