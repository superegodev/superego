import { parseDate } from "@internationalized/date";
import { useController } from "react-hook-form";
import classnames from "../../../../../utils/classnames.js";
import DatePicker from "../../../../design-system/forms/DatePicker.js";
import DatePickerCalendar from "../../../../design-system/forms/DatePickerCalendar.js";
import DatePickerInput from "../../../../design-system/forms/DatePickerInput.js";
import FieldError from "../../../../design-system/forms/FieldError.js";
import AnyFieldLabel from "../../AnyFieldLabel.js";
import * as cs from "../../RHFContentField.css.js";
import { useUiOptions } from "../../uiOptions.js";
import type Props from "../Props.js";

export default function PlainDate({
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { isReadOnly } = useUiOptions();
  const { field, fieldState } = useController({ control, name });
  return (
    <DatePicker
      id={field.name}
      name={field.name}
      value={field.value ? parseDate(field.value) : null}
      onChange={(value) => {
        field.onChange(value?.toString() ?? null);
      }}
      onBlur={field.onBlur}
      validationBehavior="aria"
      isInvalid={fieldState.invalid}
      isReadOnly={isReadOnly}
      aria-label={isListItem ? label : undefined}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      data-testid="widgets.RHFContentField.StringField.PlainDate.root"
      className={classnames(isListItem && cs.ListItemField.root)}
    >
      {!isListItem ? (
        <AnyFieldLabel
          name={field.name}
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          label={label}
        />
      ) : null}
      <DatePickerInput
        ref={field.ref}
        onClear={field.value !== null ? () => field.onChange(null) : undefined}
      />
      <FieldError>{fieldState.error?.message}</FieldError>
      <DatePickerCalendar />
    </DatePicker>
  );
}
