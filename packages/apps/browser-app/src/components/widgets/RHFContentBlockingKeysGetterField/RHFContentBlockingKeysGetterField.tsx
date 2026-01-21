import type { TypescriptFile } from "@superego/backend";
import type { Schema } from "@superego/schema";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { useController } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import forms from "../../../business-logic/forms/forms.js";
import formattedMessageHtmlTags from "../../../utils/formattedMessageHtmlTags.js";
import { Description, Switch } from "../../design-system/forms/forms.js";
import RHFTypescriptModuleField from "../RHFTypescriptModuleField/RHFTypescriptModuleField.js";
import * as cs from "./RHFContentBlockingKeysGetterField.css.js";

interface Props {
  control: Control<any>;
  name: string;
  isDisabled?: boolean | undefined;
  schema: Schema;
  schemaTypescriptLib: TypescriptFile | null;
}
export default function RHFContentBlockingKeysGetterField({
  control,
  name,
  isDisabled,
  schema,
  schemaTypescriptLib,
}: Props) {
  const intl = useIntl();
  const { field } = useController({ control, name });
  const isDeduplicationEnabled = field.value !== null;
  const handleSwitchChange = (isSelected: boolean) =>
    field.onChange(
      isSelected ? forms.defaults.contentBlockingKeysGetter(schema) : null,
    );
  const typescriptLibs = useMemo(
    () => (schemaTypescriptLib ? [schemaTypescriptLib] : []),
    [schemaTypescriptLib],
  );
  const includedGlobalUtils = useMemo(() => ({ LocalInstant: false }), []);
  return (
    <div>
      <Switch
        isSelected={isDeduplicationEnabled}
        onChange={handleSwitchChange}
        isDisabled={isDisabled}
      >
        <FormattedMessage defaultMessage="Enable deduplication" />
      </Switch>
      <Description
        className={
          cs.RHFContentBlockingKeysGetterField.deduplicationDescription
        }
      >
        <FormattedMessage
          defaultMessage={`
          <p>
            Document deduplication helps you avoid creating duplicate records.
            For example, preventing a second contact from being created with the
            same email address.
          </p>
          <p>
            When enabled, every time you create a new document, Superego checks
            that another <i>similar document</i> doesn't already exist, and
            warns you if it does.
          </p>
          <p>
            This is done by associating to each document a set of <b>"blocking
            keys"</b>: small, deterministic fingerprints derived from the
            document’s content (for example, a normalized email address, or a
            last-name + postal-code pair) that <i>almost uniquely</i> identify a
            document. If two documents share a blocking key, they’re likely
            duplicates.
          </p>
        `}
          values={formattedMessageHtmlTags}
        />
      </Description>
      {isDeduplicationEnabled ? (
        <RHFTypescriptModuleField
          label={intl.formatMessage({
            defaultMessage: "Content blocking keys getter",
          })}
          control={control}
          name={name}
          isDisabled={isDisabled}
          language="typescript"
          typescriptLibs={typescriptLibs}
          includedGlobalUtils={includedGlobalUtils}
          assistantImplementation={{
            description: `
Blocking keys are unique signatures derived from a document's content. They are
the sole mechanism for warning the user about duplicates.

Golden Rule: If two documents share a blocking key, the user will be warned
immediately. Generate a key only when sharing that key implies a very high
probability the documents refer to the same real-world entity.

This module implements and default-exports the function that derives these keys.

Guidelines:

1. Prioritize specificity
   - Do not generate keys from common/generic fields alone (e.g., not just
     "City" or "First Name").
   - Prefer combining fields to form a specific signature (e.g., "First Name +
     Last Name", "Date + Amount").

2. Normalize to handle variations
   - Inputs may be messy; apply strict normalization.
   - Lowercase everything; trim whitespace; strip punctuation from phone
     numbers.

3. Use multiple strong vectors
   - A document may have multiple independent strong identifiers; return a key
     for each strong identifier available.
   - Avoid requiring all identifiers to match in a single key (e.g., do not
     build one giant key like Name+Email+Phone); changes to one field should not
     eliminate all matching.

4. Deterministic output
   - The same content must always produce the exact same array of strings.
            `.trim(),
            template: forms.defaults.contentBlockingKeysGetter(schema).source,
            userRequest: "Complete the implementation.",
          }}
          description={
            <FormattedMessage
              defaultMessage={`
               <p>
                  The <b>content blocking keys</b> of a document are a list of
                  <code>strings</code>—derived from the document's content—that
                  uniquely identify the document based on its data. Documents
                  sharing a blocking key are considered duplicates.
                </p>
                <p>
                  The <b>blocking keys getter</b> is the TypeScript function that
                  derives these keys from the document content.
                </p>
                <p>
                  The keys should be deterministic (same content produces
                  same keys) and sensitive to meaningful changes while
                  ignoring non-meaningful differences like whitespace.
                </p>
              `}
              values={formattedMessageHtmlTags}
            />
          }
        />
      ) : null}
    </div>
  );
}
