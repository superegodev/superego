import { useController } from "react-hook-form";
import classnames from "../../../../../utils/classnames.js";
import {
  FieldError,
  Input,
  TextField,
} from "../../../../design-system/forms/forms.js";
import AnyFieldLabel from "../../AnyFieldLabel.js";
import * as cs from "../../RHFContentField.css.js";
import { useUiOptions } from "../../uiOptions.js";
import type Props from "../Props.js";

export default function Default({
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
    <TextField
      id={field.name}
      name={field.name}
      value={field.value ?? ""}
      onChange={(value) => field.onChange(value !== "" ? value : null)}
      onBlur={field.onBlur}
      validationBehavior="aria"
      autoComplete="off"
      isInvalid={fieldState.invalid}
      isReadOnly={isReadOnly}
      aria-label={isListItem ? label : undefined}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      data-testid="widgets.RHFContentField.StringField.Default.root"
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
    </TextField>
  );
}
