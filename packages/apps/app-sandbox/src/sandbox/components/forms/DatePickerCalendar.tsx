import { getLocalTimeZone, isToday } from "@internationalized/date";
import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Dialog,
  Heading,
} from "react-aria-components";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";
import Button from "../Button/Button.js";
import Popover from "../Popover/Popover.js";
import * as cs from "./forms.css.js";

export default function DatePickerCalendar() {
  return (
    <Popover>
      <Dialog>
        <Calendar>
          <header className={cs.DatePickerCalendar.header}>
            <Button
              slot="previous"
              variant="invisible"
              className={cs.DatePickerCalendar.previousNextButton}
            >
              <PiCaretLeft aria-hidden="true" />
            </Button>
            <Heading className={cs.DatePickerCalendar.heading} />
            <Button
              slot="next"
              variant="invisible"
              className={cs.DatePickerCalendar.previousNextButton}
            >
              <PiCaretRight aria-hidden="true" />
            </Button>
          </header>
          <CalendarGrid>
            <CalendarGridHeader>
              {(day) => (
                <CalendarHeaderCell
                  className={cs.DatePickerCalendar.headerCell}
                >
                  {day}
                </CalendarHeaderCell>
              )}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => (
                <CalendarCell
                  className={cs.DatePickerCalendar.cell}
                  data-is-today={isToday(date, getLocalTimeZone())}
                  date={date}
                />
              )}
            </CalendarGridBody>
          </CalendarGrid>
        </Calendar>
      </Dialog>
    </Popover>
  );
}
