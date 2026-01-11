import { parseTime } from "@internationalized/date";
import { useController } from "react-hook-form";
import classnames from "../../../../../utils/classnames.js";
import FieldError from "../../../../design-system/forms/FieldError.js";
import TimeField from "../../../../design-system/forms/TimeField.js";
import TimeInputWithMilliseconds from "../../../../design-system/forms/TimeInputWithMilliseconds.js";
import AnyFieldLabel from "../../AnyFieldLabel.js";
import * as cs from "../../RHFContentField.css.js";
import { useUiOptions } from "../../uiOptions.js";
import type Props from "../Props.js";

export default function PlainTime({
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { isReadOnly } = useUiOptions();
  const { field, fieldState } = useController({ control, name });

  const { time, milliseconds } = field.value
    ? parseTimeWithMilliseconds(field.value)
    : { time: "", milliseconds: 0 };

  const handleTimeChange = (value: { toString(): string } | null) => {
    if (!value) {
      field.onChange(null);
      return;
    }
    field.onChange(formatTimeWithMilliseconds(value.toString(), milliseconds));
  };

  const handleMillisecondsChange = (milliseconds: number) => {
    if (!time) {
      return;
    }
    field.onChange(formatTimeWithMilliseconds(time, milliseconds));
  };

  return (
    <TimeField
      id={field.name}
      name={field.name}
      value={time ? parseTime(time) : null}
      onChange={handleTimeChange}
      onBlur={field.onBlur}
      granularity="second"
      validationBehavior="aria"
      isInvalid={fieldState.invalid}
      isReadOnly={isReadOnly}
      aria-label={isListItem ? label : undefined}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      className={classnames(isListItem && cs.ListItemField.root)}
    >
      {!isListItem ? (
        <AnyFieldLabel
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          label={label}
        />
      ) : null}
      <TimeInputWithMilliseconds
        ref={field.ref}
        milliseconds={milliseconds}
        onMillisecondsChange={handleMillisecondsChange}
        isReadOnly={isReadOnly}
      />
      <FieldError>{fieldState.error?.message}</FieldError>
    </TimeField>
  );
}

function parseTimeWithMilliseconds(value: string): {
  time: string;
  milliseconds: number;
} {
  const match = value.match(/^(.+?)(?:\.(\d{1,3}))?$/);
  if (!match?.[1]) {
    return { time: value, milliseconds: 0 };
  }
  const time = match[1];
  const millisecondSegment = match[2] ?? "0";
  const milliseconds = Number.parseInt(millisecondSegment.padEnd(3, "0"), 10);
  return { time, milliseconds };
}

function formatTimeWithMilliseconds(
  time: string,
  milliseconds: number,
): string {
  const millisecondsSegment = milliseconds.toString().padStart(3, "0");
  return `${time}.${millisecondsSegment}`;
}
