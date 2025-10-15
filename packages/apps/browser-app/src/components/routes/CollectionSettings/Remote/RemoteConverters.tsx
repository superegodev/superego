import type { Collection, Connector, TypescriptLib } from "@superego/backend";
import { codegen } from "@superego/schema";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
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
  const fromRemoteDocumentTypescriptLibs = useMemo<TypescriptLib[]>(() => {
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
  const toProtoRemoteDocumentTypescriptLibs = useMemo<TypescriptLib[]>(() => {
    if (!connector) {
      return [];
    }
    return [
      {
        path: wellKnownLibPaths.collectionSchema,
        source: codegen(collection.latestVersion.schema),
      },
      {
        path: wellKnownLibPaths.protoRemoteDocumentSchema,
        // TODO
        source: connector.protoRemoteDocumentTypescriptSchema!.types,
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
          typescriptLibs={fromRemoteDocumentTypescriptLibs}
          includedGlobalUtils={includedGlobalUtils}
          assistantImplementationInstructions={`
We're syncing a remote database collection with a local one. Remote and local
documents have different shapes, so a function is needed to convert between the
two shapes. This is the function. It takes in a remote document as first and
only argument, and returns a local document. The local document must STRICTLY
abide by the TypeScript type that describes it.

If a remote document can't (e.g., missing required properties) or shouldn't
(e.g., it not relevant) be converted into a local document, return null, and the
remote document will not be synced into a local one.
          `.trim()}
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
        <RHFTypescriptModuleField
          control={control}
          name="remoteConverters.toProtoRemoteDocument"
          label={intl.formatMessage({
            defaultMessage: "To proto remote document",
          })}
          typescriptLibs={toProtoRemoteDocumentTypescriptLibs}
          includedGlobalUtils={includedGlobalUtils}
          assistantImplementationInstructions={`
We're syncing a local database collection with a remote one. Local and remote
documents have different shapes, so a function is needed to convert between the
two shapes. This is the function. It takes in a local document as first and
only argument, and returns the "proto remote document" from which the remote
document will be created. The proto remote document must STRICTLY abide by the
TypeScript type that describes it.

If a local document can't (e.g., missing required properties) or shouldn't
(e.g., it not relevant) be converted into a remote document, return null, and
the remote document will not be created.
          `.trim()}
          description={
            <FormattedMessage
              defaultMessage={`
                TODO
              `}
              values={formattedMessageHtmlTags}
            />
          }
        />
      </Fieldset.Fields>
    </Fieldset>
  );
}
