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
  Switch,
} from "../../design-system/forms/forms.js";
import InlineCode from "../../design-system/InlineCode/InlineCode.js";
import CodeInput from "../CodeInput/CodeInput.js";
import * as cs from "./RHFDefaultDocumentContentField.css.js";

interface Props {
  control: Control<any>;
  name: string;
  label?: string | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  autoFocus?: boolean | undefined;
  className?: string | undefined;
}
export default function RHFDefaultDocumentContentField({
  control,
  name,
  label,
  isDisabled,
  isReadOnly,
  autoFocus,
  className,
}: Props) {
  const { field, fieldState } = useController({ control, name });
  const isEnabled = field.value !== null;
  const handleSwitchChange = (isSelected: boolean) =>
    field.onChange(isSelected ? {} : null);
  const [jsonValue, setJsonValue] = useState(() =>
    typeof field.value === "string"
      ? field.value
      : JSON.stringify(field.value, null, 2),
  );
  const errors = forms.utils.flattenError(fieldState.error);
  const handleChange = useCallback(
    (newValue: string) => {
      setJsonValue(newValue);
      if (newValue === "") {
        field.onChange(null);
      } else {
        try {
          field.onChange(JSON.parse(newValue));
        } catch {
          field.onChange(newValue);
        }
      }
    },
    [field.onChange],
  );
  return (
    <div
      className={classnames(cs.RHFDefaultDocumentContentField.root, className)}
    >
      <div
        className={cs.RHFDefaultDocumentContentField.switchGroup}
        data-disabled={isDisabled ? "true" : undefined}
      >
        <Switch
          isSelected={isEnabled}
          onChange={handleSwitchChange}
          isDisabled={isDisabled}
        >
          <FormattedMessage defaultMessage="Enable default document content" />
        </Switch>
        <Description
          className={cs.RHFDefaultDocumentContentField.switchDescription}
        >
          <FormattedMessage defaultMessage="Set default values for new documents created in this collection. The content must match the collection schema." />
        </Description>
      </div>
      {isEnabled ? (
        <div
          data-disabled={isDisabled}
          className={cs.RHFDefaultDocumentContentField.codeInputGroup}
        >
          {label ? <Label>{label}</Label> : null}
          <CodeInput
            language="json"
            value={jsonValue}
            onChange={handleChange}
            ariaLabel={label}
            filePath="/defaultDocumentContent.json"
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
                  <div
                    key={path}
                    className={cs.RHFDefaultDocumentContentField.errorLine}
                  >
                    <FormattedMessage defaultMessage="At" />{" "}
                    <InlineCode
                      className={cs.RHFDefaultDocumentContentField.inlineCode}
                    >
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
            <FormattedMessage defaultMessage="Defines the default content for new documents in this collection." />
          </Description>
        </div>
      ) : null}
    </div>
  );
}
