import { Button, DateInput, DateSegment, Group } from "react-aria-components";
import type { RefCallBack } from "react-hook-form";
import { PiCaretDown, PiX } from "react-icons/pi";
import { useIntl } from "react-intl";
import * as cs from "./forms.css.js";

interface Props {
  ref: RefCallBack;
  onClear?: (() => void) | undefined;
}
export default function DatePickerInput({ ref, onClear }: Props) {
  const intl = useIntl();
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
      {onClear ? (
        <Button
          slot={null}
          aria-label={intl.formatMessage({ defaultMessage: "Clear" })}
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
