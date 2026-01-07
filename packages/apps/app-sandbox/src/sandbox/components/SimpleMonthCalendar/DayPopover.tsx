import { getLocalTimeZone } from "@internationalized/date";
import type { ReactNode } from "react";
import { useDateFormatter } from "react-aria";
import { Dialog, Heading, OverlayArrow } from "react-aria-components";
import useIntlMessages from "../../business-logic/intl-messages/useIntlMessages.js";
import IconButton from "../IconButton/IconButton.js";
import Popover from "../Popover/Popover.js";
import { useDay } from "./DayContext.js";
import * as cs from "./SimpleMonthCalendar.css.js";

interface Props {
  shouldCloseOnInteractOutside?: boolean;
  children: ReactNode;
}
export default function DayPopover({
  shouldCloseOnInteractOutside,
  children,
}: Props) {
  const { date, calendarCellRef, onUnselectDate } = useDay();
  const dateFormatter = useDateFormatter({
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const { closeDayPopoverButton } = useIntlMessages("SimpleMonthCalendar");
  return (
    <Popover
      triggerRef={calendarCellRef}
      placement="right"
      isOpen={true}
      onOpenChange={onUnselectDate}
      shouldCloseOnInteractOutside={() => shouldCloseOnInteractOutside ?? true}
      className={cs.DayPopover.root}
    >
      <OverlayArrow className={cs.DayPopover.overlayArrow}>
        <svg
          width={12}
          height={12}
          viewBox="0 0 12 12"
          className={cs.DayPopover.overlayArrowSvg}
        >
          <path d="M0 0 L6 6 L12 0" />
        </svg>
      </OverlayArrow>
      <Dialog className={cs.DayPopover.dialog}>
        <header className={cs.DayPopover.header}>
          <Heading slot="title" className={cs.DayPopover.heading}>
            {dateFormatter.format(date.toDate(getLocalTimeZone()))}
          </Heading>
          <IconButton
            icon="x"
            variant="invisible"
            size="md"
            label={closeDayPopoverButton}
            onPress={onUnselectDate}
            className={cs.DayPopover.closeButton}
          />
        </header>
        <div className={cs.DayPopover.content}>{children}</div>
      </Dialog>
    </Popover>
  );
}
