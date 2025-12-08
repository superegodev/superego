import {
  getLocalTimeZone,
  getWeeksInMonth,
  today,
} from "@internationalized/date";
import { cloneElement, type JSX, useState } from "react";
import {
  Calendar,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  type DateValue,
  useLocale,
} from "react-aria-components";
import DayCell from "./DayCell.js";
import DayPopover from "./DayPopover.js";
import Header from "./Header.js";
import * as cs from "./SimpleMonthCalendar.css.js";

interface Props {
  renderDayCell(day: string): JSX.Element;
  renderDayPopover?: (() => JSX.Element) | undefined;
  firstDayOfWeek?:
    | "sun"
    | "mon"
    | "tue"
    | "wed"
    | "thu"
    | "fri"
    | "sat"
    | undefined;
}
export default function SimpleMonthCalendar({
  renderDayCell,
  renderDayPopover,
  firstDayOfWeek,
}: Props) {
  const { locale } = useLocale();
  const [selectedDate, setSelectedDate] = useState<DateValue | null>(null);
  const [focusedDate, setFocusedDate] = useState<DateValue | null>(
    today(getLocalTimeZone()),
  );

  return (
    <Calendar
      isReadOnly={renderDayPopover === undefined}
      value={selectedDate}
      onChange={setSelectedDate}
      focusedValue={focusedDate}
      onFocusChange={setFocusedDate}
      firstDayOfWeek={firstDayOfWeek}
      className={cs.SimpleMonthCalendar.root}
    >
      {({ state }) => (
        <>
          <Header
            onResetFocus={() => setFocusedDate(today(getLocalTimeZone()))}
          />
          <CalendarGrid
            weekdayStyle="short"
            className={cs.SimpleMonthCalendar.grid}
          >
            <CalendarGridHeader className={cs.SimpleMonthCalendar.gridHeader}>
              {(day) => (
                <CalendarHeaderCell
                  className={cs.SimpleMonthCalendar.gridHeaderCell}
                >
                  {day}
                </CalendarHeaderCell>
              )}
            </CalendarGridHeader>
            <CalendarGridBody
              className={cs.SimpleMonthCalendar.gridBody}
              style={{
                ["--rows" as any]: getWeeksInMonth(
                  state.visibleRange.start,
                  locale,
                ),
              }}
            >
              {(date) =>
                cloneElement(renderDayCell(date.toString().split("T")[0]!), {
                  date: date,
                  onUnselectDate: () => setSelectedDate(null),
                  renderDayPopover: renderDayPopover,
                })
              }
            </CalendarGridBody>
          </CalendarGrid>
        </>
      )}
    </Calendar>
  );
}

SimpleMonthCalendar.DayCell = DayCell;
SimpleMonthCalendar.DayPopover = DayPopover;
