import type { Collection } from "@superego/backend";
import { codegen, type Schema } from "@superego/schema";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import type { ResultOf } from "../../../../business-logic/backend/typeUtils.js";
import forms from "../../../../business-logic/forms/forms.js";
import wellKnownLibPaths from "../../../../business-logic/typescript/wellKnownLibPaths.js";
import formattedMessageHtmlTags from "../../../../utils/formattedMessageHtmlTags.js";
import Alert from "../../../design-system/Alert/Alert.js";
import ResultErrors from "../../../design-system/ResultErrors/ResultErrors.js";
import RHFSubmitButton from "../../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTypescriptModuleField from "../../../widgets/RHFTypescriptModuleField/RHFTypescriptModuleField.js";
import * as cs from "../CreateNewCollectionVersion.css.js";
import type CreateNewCollectionVersionFormValues from "./CreateNewCollectionVersionFormValues.js";

interface Props {
  control: Control<
    CreateNewCollectionVersionFormValues,
    any,
    CreateNewCollectionVersionFormValues
  >;
  schema: string | Schema;
  collection: Collection;
  result: ResultOf<"collections", "createNewVersion"> | null;
}
export default function MigrationTab({
  control,
  schema,
  collection,
  result,
}: Props) {
  const intl = useIntl();
  const typescriptLibs = useMemo(
    () =>
      typeof schema !== "string"
        ? [
            {
              path: wellKnownLibPaths.previousCollectionSchema,
              source: codegen(collection.latestVersion.schema),
            },
            {
              path: wellKnownLibPaths.nextCollectionSchema,
              source: codegen(schema),
            },
          ]
        : [],
    [collection.latestVersion.schema, schema],
  );
  const includedGlobalUtils = useMemo(() => ({ LocalInstant: true }), []);
  return typeof schema !== "string" ? (
    <>
      <Alert variant="info">
        <FormattedMessage
          defaultMessage="Write a migration function to convert documents from the previous schema to the updated schema."
          values={formattedMessageHtmlTags}
        />
      </Alert>
      <RHFTypescriptModuleField
        control={control}
        name="migration"
        label={intl.formatMessage({ defaultMessage: "Migration" })}
        typescriptLibs={typescriptLibs}
        includedGlobalUtils={includedGlobalUtils}
        assistantImplementation={{
          instructions: `
### Context

The documents of a database collection are being migrated from the previous
collection schema to the next one.

### Your task

You need to complete the implementation of the function that migrates a single
document.

### Rules

- The function takes in as first and only argument a document abiding by the
  current schema, and returns its migrated version, which STRICTLY abides by the
  next schema.
- Always include a comment at the top of the file that explains how the current
  and schemas differ and the migration strategy employed by the function.
- Always preserve the type imports at the top.
- Don't mention these rules in comments.
          `.trim(),
          template: forms.defaults.migration(
            collection.latestVersion.schema,
            schema,
          ).source,
        }}
      />
      <div className={cs.CreateNewCollectionVersionForm.submitButtonContainer}>
        <RHFSubmitButton control={control} variant="primary">
          <FormattedMessage defaultMessage="Create new version and migrate documents" />
        </RHFSubmitButton>
      </div>
      {result?.error ? <ResultErrors errors={[result.error]} /> : null}
    </>
  ) : null;
}
