import { useController } from "react-hook-form";
import classnames from "../../../../../utils/classnames.js";
import {
  FieldError,
  Input,
  TextField as TextFieldForm,
} from "../../../../design-system/forms/forms.js";
import AnyFieldLabel from "../../AnyFieldLabel.jsx";
import * as cs from "../../RHFContentField.css.js";
import type Props from "../Props.js";

export default function Default({
  typeDefinition,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { field, fieldState } = useController({ control, name });
  return (
    <TextFieldForm
      id={field.name}
      name={field.name}
      value={field.value ?? ""}
      onChange={(value) => field.onChange(value !== "" ? value : null)}
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
      <Input ref={field.ref} placeholder="null" />
      <FieldError>{fieldState.error?.message}</FieldError>
    </TextFieldForm>
  );
}
