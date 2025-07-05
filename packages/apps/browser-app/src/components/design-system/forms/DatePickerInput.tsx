import { Button, DateInput, DateSegment, Group } from "react-aria-components";
import type { RefCallBack } from "react-hook-form";
import { PiCaretDown } from "react-icons/pi";
import * as cs from "./forms.css.js";

interface Props {
  ref: RefCallBack;
}
export default function DatePickerInput({ ref }: Props) {
  return (
    <Group className={cs.DatePickerInput.root}>
      <DateInput className={cs.DatePickerInput.dateInput}>
        {(segment) => (
          <DateSegment
            ref={segment.type === "day" ? ref : undefined}
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
