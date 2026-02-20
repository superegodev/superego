import { Button, DateInput, DateSegment, Group } from "react-aria-components";
import { PiCaretDown, PiX } from "react-icons/pi";
import useIntlMessages from "../../business-logic/intl-messages/useIntlMessages.js";
import * as cs from "./forms.css.js";

interface Props {
  onClear?: (() => void) | undefined;
}
export default function DateRangePickerInput({ onClear }: Props) {
  const { clearButton } = useIntlMessages("forms");
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
      {onClear ? (
        <Button
          slot={null}
          aria-label={clearButton}
          onPress={onClear}
          className={cs.DateRangePickerInput.clearButton}
        >
          <PiX aria-hidden="true" />
        </Button>
      ) : null}
      <Button className={cs.DateRangePickerInput.button}>
        <PiCaretDown aria-hidden="true" />
      </Button>
    </Group>
  );
}
