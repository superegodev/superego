import { useCallback, useState } from "react";
import { FieldErrorContext } from "react-aria-components";
import { type Control, useController } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import forms from "../../../business-logic/forms/forms.js";
import { vars } from "../../../themes.css.js";
import classnames from "../../../utils/classnames.js";
import {
  Description,
  FieldError,
  Label,
} from "../../design-system/forms/forms.js";
import InlineCode from "../../design-system/InlineCode/InlineCode.js";
import CodeInput from "../CodeInput/CodeInput.js";
import * as cs from "./RHFSchemaField.css.js";

interface Props {
  control: Control<any>;
  name: string;
  label?: string | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  autoFocus?: boolean | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
}
export default function RHFSchemaField({
  control,
  name,
  label,
  isDisabled,
  isReadOnly,
  autoFocus,
  className,
}: Props) {
  const { field, fieldState } = useController({ control, name });
  const [jsonValue, setJsonValue] = useState(() =>
    typeof field.value === "string"
      ? field.value
      : JSON.stringify(field.value, null, 2),
  );
  const errors = forms.utils.flattenError(fieldState.error);
  const handleChange = useCallback(
    (newValue: string) => {
      setJsonValue(newValue);
      try {
        field.onChange(JSON.parse(newValue));
      } catch {
        field.onChange(newValue);
      }
    },
    [field.onChange],
  );
  return (
    <div
      data-disabled={isDisabled}
      className={classnames(cs.RHFSchemaField.root, className)}
    >
      {label ? <Label>{label}</Label> : null}
      <CodeInput
        language="json"
        value={jsonValue}
        onChange={handleChange}
        ariaLabel={label}
        filePath="/schema.json"
        onBlur={field.onBlur}
        autoFocus={autoFocus}
        isInvalid={fieldState.invalid}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        maxHeight={vars.spacing._160}
        ref={field.ref}
      />
      <FieldErrorContext
        value={{
          isInvalid: fieldState.invalid,
          validationErrors: errors.length > 0 ? [errors[0]!.message] : [],
          validationDetails: {} as any,
        }}
      >
        <FieldError>
          {typeof field.value === "string" ? (
            <FormattedMessage defaultMessage="Not a valid JSON string" />
          ) : (
            errors.map(({ path, message }) => (
              <div key={path} className={cs.RHFSchemaField.errorLine}>
                <FormattedMessage defaultMessage="At" />{" "}
                <InlineCode className={cs.RHFSchemaField.inlineCode}>
                  {path}
                </InlineCode>
                {": "}
                {message}
              </div>
            ))
          )}
        </FieldError>
      </FieldErrorContext>
      <Description>
        <FormattedMessage defaultMessage='Defines the "shape" of document contents in this collection.' />
      </Description>
    </div>
  );
}
