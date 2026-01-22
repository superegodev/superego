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
  const includedGlobalUtils = useMemo(() => ({ LocalInstant: true }), []);
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
immediately. Generate a key only when sharing that key would make a human
reviewer say "these are probably the same thing" without needing to inspect
further details.

This module implements and default-exports the function that derives these keys.

Guidelines:

1. Reason about the domain first
   - Before generating keys, consider: what makes two documents represent the
     same real-world entity in this domain?
   - Focus on identifying characteristics, not details that might vary between
     duplicate entries.

2. Prioritize specificity
   - Do not generate keys from common/generic fields alone (e.g., not just
     "City" or "First Name").
   - Prefer combining fields to form a specific signature (e.g., "First Name +
     Last Name", "Date + Amount").

3. Normalize to handle variations
   - Inputs may be messy; apply strict normalization.
   - Lowercase everything; trim whitespace; strip punctuation from phone
     numbers.

4. Use multiple independent identifiers
   - A document may have several fields that independently identify it.
   - Generate one key per independent identifier, not combinations of them.
   - Example: A contact with email AND phone should yield two keys (one for
     email, one for phone), not one key combining both.
   - Bad: ["email:phone:name"] - requires all three to match
   - Bad: ["name", "name:email", "name:email:phone"] - redundant hierarchy
   - Good: ["email", "phone", "name:dob"] - independent matching paths

5. Keys must be independent matching paths
   - Each key should represent a distinct way two documents could be duplicates.
   - Never generate a key that is a strict superset of another key (if key A
     matching implies key B matching, don't generate key A).
   - Think of keys as OR conditions: you want keys that catch different
     duplicate scenarios, not increasingly strict versions of the same scenario.

6. Prefer broader keys when in doubt
   - When uncertain whether to include a field, leave it out.
   - A false positive (warning about non-duplicates) is less harmful than a
     false negative (missing a true duplicate).
   - Use the minimum number of fields needed to identify the entity.

7. Deterministic output
   - The same content must always produce the exact same array of strings.

Anti-pattern to avoid:
  Do NOT generate hierarchical keys where each key adds more specificity to
  the previous one. For example, if matching on "date + type" is sufficient
  to flag a duplicate, do not also generate "date + type + item1" or
  "date + type + allItems". The broader key already catches these.
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
