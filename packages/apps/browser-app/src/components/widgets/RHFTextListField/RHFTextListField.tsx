import type { ReactNode } from "react";
import {
  type Control,
  type FieldArrayPath,
  type FieldPath,
  type FieldValues,
  useFieldArray,
} from "react-hook-form";
import { PiBackspace, PiPlus } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import FieldLabel from "../../design-system/FieldLabel/FieldLabel.js";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import { Description } from "../../design-system/forms/forms.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import RHFTextField from "../RHFTextField/RHFTextField.js";
import * as cs from "./RHFTextListField.css.js";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: FieldArrayPath<T>;
  label: ReactNode;
  description?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
  renderItem?:
    | ((name: FieldPath<T>, index: number, autoFocus: boolean) => ReactNode)
    | undefined;
}
export default function RHFTextListField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  isDisabled,
  isReadOnly,
  placeholder,
  className,
  renderItem,
}: Props<T>) {
  const intl = useIntl();
  const { fields, append, remove } = useFieldArray<FieldValues>({
    control: control as Control<FieldValues>,
    name,
  });
  const hideActions = isDisabled || isReadOnly;
  return (
    <Fieldset
      className={className}
      isDisclosureDisabled={true}
      disabled={isDisabled}
    >
      <FieldLabel
        component="legend"
        actions={
          !hideActions ? (
            <FieldLabel.Action
              label={intl.formatMessage({ defaultMessage: "Add" })}
              onPress={() => append({ value: "" })}
            >
              <PiPlus />
            </FieldLabel.Action>
          ) : null
        }
      >
        {label}
      </FieldLabel>
      <Fieldset.Fields className={cs.RHFTextListField.fields}>
        {fields.length === 0 ? (
          <div className={cs.RHFTextListField.emptyItemsPlaceholder}>
            <FormattedMessage defaultMessage="There are no items in the list" />
          </div>
        ) : null}
        {fields.map((field, index) => (
          <div key={field.id} className={cs.RHFTextListField.item}>
            {renderItem ? (
              renderItem(
                `${name}.${index}.value` as FieldPath<T>,
                index,
                !hideActions && index === fields.length - 1,
              )
            ) : (
              <RHFTextField
                control={control}
                name={`${name}.${index}.value` as FieldPath<T>}
                isDisabled={isDisabled}
                isReadOnly={isReadOnly}
                ariaLabel={intl.formatMessage(
                  { defaultMessage: "Item {number}" },
                  { number: index + 1 },
                )}
                autoFocus={!hideActions && index === fields.length - 1}
                placeholder={placeholder}
                className={cs.RHFTextListField.itemTextField}
              />
            )}
            {!hideActions && (
              <IconButton
                variant="invisible"
                onPress={() => remove(index)}
                label={intl.formatMessage({ defaultMessage: "Remove" })}
                isDisabled={isDisabled}
                className={cs.RHFTextListField.itemRemoveButton}
              >
                <PiBackspace />
              </IconButton>
            )}
          </div>
        ))}
        {description ? <Description>{description}</Description> : null}
      </Fieldset.Fields>
    </Fieldset>
  );
}
