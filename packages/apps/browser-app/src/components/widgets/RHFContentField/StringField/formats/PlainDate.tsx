import { parseDate } from "@internationalized/date";
import { useController } from "react-hook-form";
import classnames from "../../../../../utils/classnames.js";
import DatePicker from "../../../../design-system/forms/DatePicker.jsx";
import DatePickerCalendar from "../../../../design-system/forms/DatePickerCalendar.js";
import DatePickerInput from "../../../../design-system/forms/DatePickerInput.js";
import FieldError from "../../../../design-system/forms/FieldError.js";
import AnyFieldLabel from "../../AnyFieldLabel.js";
import * as cs from "../../RHFContentField.css.js";
import type Props from "../Props.js";

export default function PlainDate({
  typeDefinition,
  isListItem,
  control,
  name,
  label,
}: Props) {
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
      aria-label={isListItem ? label : undefined}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      className={classnames(isListItem && cs.ListItemField.root)}
    >
      {!isListItem ? (
        <AnyFieldLabel typeDefinition={typeDefinition} label={label} />
      ) : null}
      <DatePickerInput ref={field.ref} />
      <FieldError>{fieldState.error?.message}</FieldError>
      <DatePickerCalendar />
    </DatePicker>
  );
}
