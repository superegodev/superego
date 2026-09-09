import type { ReactNode } from "react";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
  useWatch,
} from "react-hook-form";
import { PiBackspace, PiPlus } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";
import FieldLabel from "../FieldLabel/FieldLabel.js";
import Fieldset from "../Fieldset/Fieldset.js";
import { Description } from "../forms/forms.js";
import IconButton from "../IconButton/IconButton.js";
import * as cs from "./RHFTextListField.css.js";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
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
  const { field } = useController({ control, name });
  const currentValue = useWatch({ control, name });
  const value: string[] = Array.isArray(currentValue) ? currentValue : [];
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
              onPress={() => field.onChange([...value, ""])}
            >
              <PiPlus />
            </FieldLabel.Action>
          ) : null
        }
      >
        {label}
      </FieldLabel>
      <Fieldset.Fields className={cs.RHFTextListField.fields}>
        {value.length === 0 ? (
          <div className={cs.RHFTextListField.emptyItemsPlaceholder}>
            <FormattedMessage defaultMessage="There are no items in the list" />
          </div>
        ) : null}
        {value.map((_, index) => (
          <div
            key={`${value.length}${index}`}
            className={cs.RHFTextListField.item}
          >
            {renderItem ? (
              renderItem(
                `${name}.${index}` as FieldPath<T>,
                index,
                !hideActions && index === value.length - 1,
              )
            ) : (
              <RHFTextField
                control={control}
                name={`${name}.${index}` as FieldPath<T>}
                isDisabled={isDisabled}
                isReadOnly={isReadOnly}
                ariaLabel={intl.formatMessage(
                  { defaultMessage: "Item {number}" },
                  { number: index + 1 },
                )}
                autoFocus={!hideActions && index === value.length - 1}
                placeholder={placeholder}
                className={cs.RHFTextListField.itemTextField}
              />
            )}
            {!hideActions && (
              <IconButton
                variant="invisible"
                onPress={() => field.onChange(value.toSpliced(index, 1))}
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
