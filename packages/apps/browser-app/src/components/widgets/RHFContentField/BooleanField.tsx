import type {
  BooleanLiteralTypeDefinition,
  BooleanTypeDefinition,
} from "@superego/schema";
import { type Control, useController } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import classnames from "../../../utils/classnames.js";
import {
  FieldError,
  Radio,
  RadioGroup,
} from "../../design-system/forms/forms.js";
import AnyFieldLabel from "./AnyFieldLabel.js";
import NullifyFieldAction from "./NullifyFieldAction.js";
import * as cs from "./RHFContentField.css.js";
import { useUiOptions } from "./uiOptions.js";

interface Props {
  typeDefinition: BooleanTypeDefinition | BooleanLiteralTypeDefinition;
  isNullable: boolean;
  isListItem: boolean;
  control: Control;
  name: string;
  label: string;
}
export default function BooleanField({
  typeDefinition,
  isListItem,
  isNullable,
  control,
  name,
  label,
}: Props) {
  const { isReadOnly } = useUiOptions();
  const { field, fieldState } = useController({ control, name });
  return (
    <RadioGroup
      id={field.name}
      name={field.name}
      value={typeof field.value === "boolean" ? String(field.value) : null}
      onChange={(value) => field.onChange(value === "true")}
      onBlur={field.onBlur}
      validationBehavior="aria"
      isInvalid={fieldState.invalid}
      isReadOnly={isReadOnly}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      data-testid="widgets.RHFContentField.BooleanField.root"
      className={classnames(cs.Field.root, isListItem && cs.ListItemField.root)}
    >
      <AnyFieldLabel
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
      <Radio value="true">
        <FormattedMessage defaultMessage="True" />
      </Radio>
      <Radio value="false">
        <FormattedMessage defaultMessage="False" />
      </Radio>
      <FieldError>{fieldState.error?.message}</FieldError>
    </RadioGroup>
  );
}
