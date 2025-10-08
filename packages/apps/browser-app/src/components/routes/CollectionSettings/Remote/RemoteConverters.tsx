import type { Collection, Connector } from "@superego/backend";
import { codegen } from "@superego/schema";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import wellKnownLibPaths from "../../../../business-logic/typescript/wellKnownLibPaths.js";
import type TypescriptLib from "../../../design-system/CodeInput/typescript/TypescriptLib.js";
import Fieldset from "../../../design-system/Fieldset/Fieldset.jsx";
import RHFTypescriptModuleField from "../../../widgets/RHFTypescriptModuleField/RHFTypescriptModuleField.jsx";
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
  const typescriptLibs = useMemo<TypescriptLib[]>(() => {
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
        source: codegen(connector.remoteDocumentSchema),
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
          description={
            <FormattedMessage defaultMessage="TypeScript function transforming a remote document into a local document." />
          }
        />
      </Fieldset.Fields>
    </Fieldset>
  );
}
