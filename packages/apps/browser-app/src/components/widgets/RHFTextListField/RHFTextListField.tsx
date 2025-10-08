import type { ReactNode } from "react";
import { type Control, useController, useWatch } from "react-hook-form";
import { PiBackspace, PiPlus } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import classnames from "../../../utils/classnames.js";
import Button from "../../design-system/Button/Button.jsx";
import FieldLabel from "../../design-system/FieldLabel/FieldLabel.jsx";
import { Description } from "../../design-system/forms/forms.js";
import IconButton from "../../design-system/IconButton/IconButton.jsx";
import RHFTextField from "../RHFTextField/RHFTextField.jsx";
import * as cs from "./RHFTextListField.css.js";

interface Props {
  control: Control<any>;
  name: string;
  label: ReactNode;
  description?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
}
export default function RHFTextListField({
  control,
  name,
  label,
  description,
  isDisabled,
  placeholder,
  className,
}: Props) {
  const intl = useIntl();
  const { field } = useController({ control, name });
  const currentValue = useWatch({ control, name });
  const value: string[] = Array.isArray(currentValue) ? currentValue : [];
  return (
    <div className={classnames(cs.RHFTextListField.root, className)}>
      <FieldLabel
        actions={
          !isDisabled ? (
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
      {field.value.length === 0 ? (
        <Button
          className={cs.RHFTextListField.emptyItemsAddButton}
          onPress={() => field.onChange([...value, ""])}
        >
          <FormattedMessage defaultMessage="Add" />
        </Button>
      ) : (
        value.map((_, index) => (
          <div
            key={`${value.length}${index}`}
            className={cs.RHFTextListField.item}
          >
            <RHFTextField
              control={control}
              name={`${name}.${index}`}
              isDisabled={isDisabled}
              ariaLabel={intl.formatMessage(
                { defaultMessage: "Item {number}" },
                { number: index + 1 },
              )}
              autoFocus={true}
              placeholder={placeholder}
              className={cs.RHFTextListField.itemTextField}
            />
            <IconButton
              variant="invisible"
              onPress={() => field.onChange(value.toSpliced(index, 1))}
              label={intl.formatMessage({ defaultMessage: "Remove" })}
              isDisabled={isDisabled}
              className={cs.RHFTextListField.itemRemoveButton}
            >
              <PiBackspace />
            </IconButton>
          </div>
        ))
      )}
      {description ? <Description>{description}</Description> : null}
    </div>
  );
}
