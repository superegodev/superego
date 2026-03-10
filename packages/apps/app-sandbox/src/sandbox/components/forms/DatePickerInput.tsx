import { Button, DateInput, DateSegment, Group } from "react-aria-components";
import { PiCaretDown, PiX } from "react-icons/pi";
import useIntlMessages from "../../business-logic/intl-messages/useIntlMessages.js";
import * as cs from "./forms.css.js";

interface Props {
  onClear?: (() => void) | undefined;
}
export default function DatePickerInput({ onClear }: Props) {
  const { clearButton } = useIntlMessages("forms");
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
      {onClear ? (
        <Button
          slot={null}
          aria-label={clearButton}
          onPress={onClear}
          className={cs.DatePickerInput.clearButton}
        >
          <PiX aria-hidden="true" />
        </Button>
      ) : null}
      <Button className={cs.DatePickerInput.button}>
        <PiCaretDown aria-hidden="true" />
      </Button>
    </Group>
  );
}
