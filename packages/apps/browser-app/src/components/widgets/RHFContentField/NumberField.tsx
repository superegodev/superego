import type {
  NumberLiteralTypeDefinition,
  NumberTypeDefinition,
} from "@superego/schema";
import { type Control, useController } from "react-hook-form";
import classnames from "../../../utils/classnames.js";
import {
  FieldError,
  Input,
  NumberField as NumberFieldDS,
} from "../../design-system/forms/forms.js";
import AnyFieldLabel from "./AnyFieldLabel.js";
import * as cs from "./RHFContentField.css.js";

interface Props {
  typeDefinition: NumberTypeDefinition | NumberLiteralTypeDefinition;
  isNullable: boolean;
  isListItem: boolean;
  control: Control;
  name: string;
  label: string;
}
export default function NumberField({
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { field, fieldState } = useController({ control, name });
  return (
    <NumberFieldDS
      id={field.name}
      name={field.name}
      value={field.value ?? Number.NaN}
      onChange={(value) => field.onChange(!Number.isNaN(value) ? value : null)}
      onBlur={field.onBlur}
      validationBehavior="aria"
      isInvalid={fieldState.invalid}
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
      <Input ref={field.ref} placeholder="null" />
      <FieldError>{fieldState.error?.message}</FieldError>
    </NumberFieldDS>
  );
}
