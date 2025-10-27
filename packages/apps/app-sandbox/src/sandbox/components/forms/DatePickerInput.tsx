import { Button, DateInput, DateSegment, Group } from "react-aria-components";
import { PiCaretDown } from "react-icons/pi";
import * as cs from "./forms.css.js";

export default function DatePickerInput() {
  return (
    <Group className={cs.DatePickerInput.root}>
      <DateInput className={cs.DatePickerInput.dateInput}>
        {(segment) => (
          <DateSegment
            segment={segment}
            className={cs.DatePickerInput.dateSegment}
          />
        )}
      </DateInput>
      <Button className={cs.DatePickerInput.button}>
        <PiCaretDown aria-hidden="true" />
      </Button>
    </Group>
  );
}
