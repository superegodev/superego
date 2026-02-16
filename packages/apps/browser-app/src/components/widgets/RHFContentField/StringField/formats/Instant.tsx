import { parseDate, parseTime } from "@internationalized/date";
import { FieldErrorContext } from "react-aria-components";
import { useController } from "react-hook-form";
import { useIntl } from "react-intl";
import classnames from "../../../../../utils/classnames.js";
import DatePicker from "../../../../design-system/forms/DatePicker.js";
import DatePickerCalendar from "../../../../design-system/forms/DatePickerCalendar.js";
import DatePickerInput from "../../../../design-system/forms/DatePickerInput.js";
import FieldError from "../../../../design-system/forms/FieldError.js";
import Input from "../../../../design-system/forms/Input.js";
import TimeField from "../../../../design-system/forms/TimeField.js";
import TimeInputWithMilliseconds from "../../../../design-system/forms/TimeInputWithMilliseconds.js";
import AnyFieldLabel from "../../AnyFieldLabel.js";
import NullifyFieldAction from "../../NullifyFieldAction.js";
import * as cs from "../../RHFContentField.css.js";
import { useUiOptions } from "../../uiOptions.js";
import type Props from "../Props.js";

export default function Instant({
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const intl = useIntl();
  const { isReadOnly } = useUiOptions();
  const { field, fieldState } = useController({ control, name });
  const segments = toSegments(field.value ?? "");
  return (
    <div
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      data-testid="widgets.RHFContentField.StringField.Instant.root"
      className={classnames(
        cs.StringField.Instant.root,
        isListItem && cs.ListItemField.root,
      )}
    >
      {!isListItem ? (
        <AnyFieldLabel
          name={field.name}
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          label={label}
          actions={
            <NullifyFieldAction
              isNullable={isNullable}
              field={field}
              fieldLabel={label}
            />
          }
        />
      ) : null}
      <div className={cs.StringField.Instant.fields}>
        <DatePicker
          id={`${field.name}-date`}
          name={`${field.name}-date`}
          value={segments.date ? parseDate(segments.date) : null}
          onChange={(newValue) =>
            field.onChange(
              fromSegments({
                ...segments,
                date: newValue?.toString() ?? null,
              }),
            )
          }
          onBlur={field.onBlur}
          validationBehavior="aria"
          isInvalid={fieldState.invalid}
          isReadOnly={isReadOnly}
          aria-label={
            isListItem
              ? intl.formatMessage(
                  { defaultMessage: "{label} date" },
                  { label },
                )
              : intl.formatMessage({ defaultMessage: "Date" })
          }
          className={cs.StringField.Instant.datePicker}
        >
          <DatePickerInput ref={field.ref} />
          <DatePickerCalendar />
        </DatePicker>
        <TimeField
          id={`${field.name}-time`}
          name={`${field.name}-time`}
          value={segments.time ? parseTime(segments.time) : null}
          onChange={(newValue) =>
            field.onChange(
              fromSegments({
                ...segments,
                time: newValue?.toString() ?? null,
              }),
            )
          }
          onBlur={field.onBlur}
          granularity="second"
          validationBehavior="aria"
          isInvalid={fieldState.invalid}
          isReadOnly={isReadOnly}
          aria-label={
            isListItem
              ? intl.formatMessage(
                  { defaultMessage: "{label} time" },
                  { label },
                )
              : intl.formatMessage({ defaultMessage: "Time" })
          }
          className={cs.StringField.Instant.timeField}
        >
          <TimeInputWithMilliseconds
            milliseconds={
              segments.milliseconds
                ? Number.parseInt(segments.milliseconds, 10)
                : null
            }
            onMillisecondsChange={(newValue) =>
              field.onChange(
                fromSegments({
                  ...segments,
                  milliseconds: newValue?.toString().padStart(3, "0") ?? null,
                }),
              )
            }
            isReadOnly={isReadOnly}
          />
        </TimeField>
        <Input
          value={segments.offset ?? ""}
          onChange={(evt) =>
            field.onChange(
              fromSegments({
                ...segments,
                offset: evt.target.value,
              }),
            )
          }
          autoComplete="off"
          readOnly={isReadOnly}
          aria-invalid={fieldState.invalid || undefined}
          aria-label={
            isListItem
              ? intl.formatMessage(
                  { defaultMessage: "{label} time offset" },
                  { label },
                )
              : intl.formatMessage({ defaultMessage: "Time offset" })
          }
          placeholder="+00:00"
          className={cs.StringField.Instant.offsetInput}
        />
      </div>
      <FieldErrorContext
        value={{
          isInvalid: fieldState.invalid,
          validationErrors: fieldState.error?.message
            ? [fieldState.error.message]
            : [],
          validationDetails: {} as any,
        }}
      >
        <FieldError>{fieldState.error?.message}</FieldError>
      </FieldErrorContext>
    </div>
  );
}

export interface Segments {
  date: string | null;
  time: string | null;
  milliseconds: string | null;
  offset: string | null;
}

export function toSegments(value: string): Segments {
  if (!value) {
    return { date: null, time: null, milliseconds: null, offset: null };
  }

  let remaining = value;
  let date: string | null = null;
  let time: string | null = null;
  let milliseconds: string | null = null;
  let offset: string | null = null;

  // Extract date (YYYY-MM-DD).
  const dateMatch = remaining.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateMatch?.[1]) {
    date = dateMatch[1];
    remaining = remaining.slice(date.length);
    // Remove the 'T' separator if present.
    if (remaining.startsWith("T")) {
      remaining = remaining.slice(1);
    }
  }

  // Extract time (HH:MM:SS).
  const timeMatch = remaining.match(/^(\d{2}:\d{2}:\d{2})/);
  if (timeMatch?.[1]) {
    time = timeMatch[1];
    remaining = remaining.slice(time.length);
    // Remove the '.' separator if present.
    if (remaining.startsWith(".")) {
      remaining = remaining.slice(1);
    }
  }

  // Extract milliseconds (digits before offset).
  const millisecondsMatch = remaining.match(/^(\d+)/);
  if (millisecondsMatch?.[1]) {
    milliseconds = millisecondsMatch[1];
    remaining = remaining.slice(milliseconds.length);
  }

  // Extract offset (Z or +/-HH:MM).
  if (remaining) {
    offset = remaining;
  }

  return { date, time, milliseconds, offset };
}

export function fromSegments(segments: Segments): string {
  return [
    segments.date ?? "",
    segments.date && segments.time ? "T" : "",
    segments.time ?? "",
    segments.time && segments.milliseconds ? "." : "",
    segments.milliseconds ?? "",
    segments.offset,
  ].join("");
}
