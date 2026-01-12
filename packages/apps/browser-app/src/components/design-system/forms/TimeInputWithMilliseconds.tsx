import { type FormEvent, type KeyboardEvent, useMemo, useRef } from "react";
import {
  DateInput,
  DateSegment,
  Group,
  useLocale,
} from "react-aria-components";
import type { RefCallBack } from "react-hook-form";
import { useIntl } from "react-intl";
import getDecimalSeparator from "../../../utils/getDecimalSeparator.js";
import * as cs from "./forms.css.js";

interface Props {
  ref: RefCallBack;
  milliseconds: number | null;
  onMillisecondsChange: (ms: number) => void;
  isReadOnly?: boolean;
}
export default function TimeInputWithMilliseconds({
  ref,
  milliseconds,
  onMillisecondsChange,
  isReadOnly,
}: Props) {
  const millisecondsInputRef = useRef<HTMLInputElement>(null);
  const { locale } = useLocale();
  const intl = useIntl();
  const decimalSeparator = useMemo(() => getDecimalSeparator(locale), [locale]);

  const handleMillisecondsBeforeInput = (
    evt: FormEvent<HTMLInputElement> & { data?: string | null },
  ) => {
    const data = evt.data;
    if (!isReadOnly && data && /^\d$/.test(data)) {
      // Shift digits left and append the new digit.
      const currentValue = milliseconds ?? 0;
      const newValue = ((currentValue * 10) % 1000) + Number.parseInt(data, 10);
      onMillisecondsChange(newValue);
    }
  };

  const handleMillisecondsKeyDown = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (!isReadOnly) {
      if (evt.key === "ArrowUp") {
        evt.preventDefault();
        onMillisecondsChange(Math.min(999, (milliseconds ?? 0) + 1));
      } else if (evt.key === "ArrowDown") {
        evt.preventDefault();
        onMillisecondsChange(Math.max(0, (milliseconds ?? 0) - 1));
      }
    }
  };

  return (
    <Group className={cs.TimeInputWithMilliseconds.root}>
      <DateInput className={cs.TimeInputWithMilliseconds.dateInput}>
        {(segment) => (
          <DateSegment
            ref={segment.type === "hour" ? ref : undefined}
            segment={segment}
            className={cs.TimeInputWithMilliseconds.segment}
          />
        )}
      </DateInput>
      <span className={cs.TimeInputWithMilliseconds.separator}>
        {decimalSeparator}
      </span>
      <input
        ref={millisecondsInputRef}
        type="text"
        inputMode="numeric"
        value={
          milliseconds === null
            ? "–––"
            : milliseconds.toString().padStart(3, "0")
        }
        // Avoids React complaining that we haven't registered an onChange
        // handler. (We do with onBeforeInput.)
        onChange={noop}
        onBeforeInput={handleMillisecondsBeforeInput}
        onKeyDown={handleMillisecondsKeyDown}
        onMouseDown={(evt) => {
          evt.stopPropagation();
        }}
        className={cs.TimeInputWithMilliseconds.millisecondsInput}
        aria-label={intl.formatMessage({ defaultMessage: "Milliseconds" })}
        readOnly={isReadOnly}
      />
    </Group>
  );
}

function noop() {}
