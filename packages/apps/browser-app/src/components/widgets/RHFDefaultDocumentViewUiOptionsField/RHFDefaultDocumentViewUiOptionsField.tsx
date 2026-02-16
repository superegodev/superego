import { useCallback, useState } from "react";
import { FieldErrorContext } from "react-aria-components";
import { type Control, useController } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import forms from "../../../business-logic/forms/forms.js";
import { vars } from "../../../themes.css.js";
import classnames from "../../../utils/classnames.js";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import {
  Description,
  FieldError,
  Label,
  Switch,
} from "../../design-system/forms/forms.js";
import InlineCode from "../../design-system/InlineCode/InlineCode.js";
import CodeInput from "../CodeInput/CodeInput.js";
import * as cs from "./RHFDefaultDocumentViewUiOptionsField.css.js";

interface Props {
  control: Control<any>;
  name: string;
  label?: string | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  autoFocus?: boolean | undefined;
  className?: string | undefined;
}
export default function RHFDefaultDocumentViewUiOptionsField({
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
    <div className={classnames(cs.RHFDefaultDocumentViewUiOptionsField.root, className)}>
      <div className={cs.RHFDefaultDocumentViewUiOptionsField.switchGroup}>
        <Switch
          isSelected={isEnabled}
          onChange={handleSwitchChange}
          isDisabled={isDisabled}
        >
          <FormattedMessage defaultMessage="Enable custom document view UI options" />
        </Switch>
        <Description
          className={
            cs.RHFDefaultDocumentViewUiOptionsField.switchDescription
          }
        >
          <FormattedMessage
            defaultMessage={`
              <p>
                Customize how the document form looks when viewing or editing
                documents in this collection. Options include using the full
                page width, collapsing the sidebar, and defining a custom field
                layout.
              </p>
              <p>
                For more information, see <a>https://superego.dev/default-document-view-ui-options</a>.
              </p>
            `}
            values={formattedMessageHtmlTags}
          />
        </Description>
      </div>
      {isEnabled ? (
        <div
          data-disabled={isDisabled}
          className={cs.RHFDefaultDocumentViewUiOptionsField.codeInputGroup}
        >
          {label ? <Label>{label}</Label> : null}
          <CodeInput
            language="json"
            value={jsonValue}
            onChange={handleChange}
            ariaLabel={label}
            filePath="/defaultDocumentViewUiOptions.json"
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
                    className={cs.RHFDefaultDocumentViewUiOptionsField.errorLine}
                  >
                    <FormattedMessage defaultMessage="At" />{" "}
                    <InlineCode
                      className={cs.RHFDefaultDocumentViewUiOptionsField.inlineCode}
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
            <FormattedMessage defaultMessage="Defines the default layout and UI options for the document form in this collection." />
          </Description>
        </div>
      ) : null}
    </div>
  );
}
