import type { Collection, Connector, TypescriptFile } from "@superego/backend";
import { codegen } from "@superego/schema";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import forms from "../../../../business-logic/forms/forms.js";
import wellKnownLibPaths from "../../../../business-logic/typescript/wellKnownLibPaths.js";
import formattedMessageHtmlTags from "../../../../utils/formattedMessageHtmlTags.js";
import Fieldset from "../../../design-system/Fieldset/Fieldset.js";
import RHFTypescriptModuleField from "../../../widgets/RHFTypescriptModuleField/RHFTypescriptModuleField.js";
import type FormValues from "./FormValues.js";

interface Props {
  control: Control<FormValues>;
  connector: Connector;
  collection: Collection;
}
export default function RemoteConverters({
  control,
  connector,
  collection,
}: Props) {
  const intl = useIntl();
  const typescriptLibs = useMemo<TypescriptFile[]>(() => {
    if (!connector) {
      return [];
    }
    return [
      {
        path: wellKnownLibPaths.collectionSchema,
        source: codegen(collection.latestVersion.schema),
      },
      {
        path: wellKnownLibPaths.remoteDocumentSchema,
        source: connector.remoteDocumentTypescriptSchema.types,
      },
    ];
  }, [connector, collection]);
  const includedGlobalUtils = useMemo(() => ({ LocalInstant: true }), []);
  return (
    <Fieldset isDisclosureDisabled={true}>
      <Fieldset.Legend>
        <FormattedMessage defaultMessage="Remote document converters" />
      </Fieldset.Legend>
      <Fieldset.Fields>
        <RHFTypescriptModuleField
          control={control}
          name="remoteConverters.fromRemoteDocument"
          label={intl.formatMessage({
            defaultMessage: "From remote document",
          })}
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

You need to complete the implementation of \`fromRemoteDocument\`.

### Additional info

If a remote document can't (e.g., missing required properties) or shouldn't
(e.g., it not relevant) be converted into a local document, return null, and the
remote document will not be synced into a local one.
            `.trim(),
            template: forms.defaults.fromRemoteDocument(
              collection.latestVersion.schema,
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
      </Fieldset.Fields>
    </Fieldset>
  );
}
