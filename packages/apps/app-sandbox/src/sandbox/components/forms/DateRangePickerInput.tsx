import { Button, DateInput, DateSegment, Group } from "react-aria-components";
import { PiCaretDown } from "react-icons/pi";
import * as cs from "./forms.css.js";

export default function DateRangePickerInput() {
  return (
    <Group className={cs.DateRangePickerInput.root}>
      <div className={cs.DateRangePickerInput.dateFields}>
        <DateInput slot="start" className={cs.DateRangePickerInput.dateInput}>
          {(segment) => (
            <DateSegment
              segment={segment}
              className={cs.DateRangePickerInput.dateSegment}
            />
          )}
        </DateInput>
        <span aria-hidden="true" className={cs.DateRangePickerInput.separator}>
          {"–"}
        </span>
        <DateInput slot="end" className={cs.DateRangePickerInput.dateInput}>
          {(segment) => (
            <DateSegment
              segment={segment}
              className={cs.DateRangePickerInput.dateSegment}
            />
          )}
        </DateInput>
      </div>
      <Button className={cs.DateRangePickerInput.button}>
        <PiCaretDown aria-hidden="true" />
      </Button>
    </Group>
  );
}
