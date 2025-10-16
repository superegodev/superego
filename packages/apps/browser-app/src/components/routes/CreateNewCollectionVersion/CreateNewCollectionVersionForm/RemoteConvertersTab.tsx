import type { Collection, Connector, TypescriptLib } from "@superego/backend";
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
import * as cs from "./CreateNewCollectionVersionForm.css.js";
import type CreateNewCollectionVersionFormValues from "./CreateNewCollectionVersionFormValues.js";

interface Props {
  control: Control<
    CreateNewCollectionVersionFormValues,
    any,
    CreateNewCollectionVersionFormValues
  >;
  collection: Collection;
  schema: string | Schema;
  connector: Connector;
  result: ResultOf<"collections", "createNewVersion"> | null;
}
export default function RemoteConvertersTab({
  control,
  collection,
  schema,
  connector,
  result,
}: Props) {
  const intl = useIntl();
  const typescriptLibs = useMemo<TypescriptLib[]>(() => {
    return typeof schema !== "string"
      ? [
          {
            path: wellKnownLibPaths.previousCollectionSchema,
            source: codegen(collection.latestVersion.schema),
          },
          { path: wellKnownLibPaths.collectionSchema, source: codegen(schema) },
          {
            path: wellKnownLibPaths.remoteDocumentSchema,
            source: connector.remoteDocumentTypescriptSchema.types,
          },
        ]
      : [];
  }, [collection, schema, connector]);
  const includedGlobalUtils = useMemo(() => ({ LocalInstant: true }), []);
  return typeof schema !== "string" ? (
    <>
      <Alert variant="info">
        <FormattedMessage
          defaultMessage="Update the <code>fromRemoteDocument</code> function to reflect schema changes."
          values={formattedMessageHtmlTags}
        />
      </Alert>
      <RHFTypescriptModuleField
        control={control}
        name="remoteConverters.fromRemoteDocument"
        label={intl.formatMessage({ defaultMessage: "From remote document" })}
        typescriptLibs={typescriptLibs}
        includedGlobalUtils={includedGlobalUtils}
        assistantImplementation={{
          instructions: `
### Context

We're syncing a remote database collection with a local one. Remote and local
documents have different shapes, and the \`fromRemoteDocument\` function
converts between the two shapes.

The function takes in a remote document as first and only argument, and returns
a local document. The local document STRICTLY abides by the TypeScript type that
describes it.

### Your task

The local shape has been changed by a database migration. You need to update
\`fromRemoteDocument\` to reflect the change.

### Additional info

If a remote document can't (e.g., missing required properties) or shouldn't
(e.g., it not relevant) be converted into a local document, return null, and the
remote document will not be synced into a local one.
          `.trim(),
          template: forms.defaults.fromRemoteDocument(
            schema,
            connector.remoteDocumentTypescriptSchema,
          ).source,
        }}
        description={
          <FormattedMessage
            defaultMessage={`
              TypeScript function transforming a remote document into the
              content of a local document. Return <code>null</code> to skip
              syncing the document.
            `}
            values={formattedMessageHtmlTags}
          />
        }
      />
      <div className={cs.RemoteConvertersTab.submitButtonContainer}>
        <RHFSubmitButton control={control} variant="primary">
          <FormattedMessage defaultMessage="Create new version and migrate documents" />
        </RHFSubmitButton>
      </div>
      {result?.error ? <ResultErrors errors={[result.error]} /> : null}
    </>
  ) : null;
}
