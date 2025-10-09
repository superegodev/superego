import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  type Collection,
  type Connector,
  ConnectorAuthenticationStrategy,
} from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import type { ReactNode } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useSetCollectionRemote } from "../../../../business-logic/backend/hooks.js";
import forms from "../../../../business-logic/forms/forms.js";
import RhfContent from "../../../../utils/RhfContent.js";
import ResultErrors from "../../../design-system/ResultErrors/ResultErrors.js";
import RHFSubmitButton from "../../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import * as cs from "../CollectionSettings.css.js";
import AuthenticationSettings from "./AuthenticationSettings.js";
import ConnectorSettings from "./ConnectorSettings.js";
import type FormValues from "./FormValues.js";
import RemoteConverters from "./RemoteConverters.js";

interface Props {
  collection: Collection;
  connector: Connector;
  authenticateConnectorButton: ReactNode;
}
export default function SetCollectionRemoteForm({
  collection,
  connector,
  authenticateConnectorButton,
}: Props) {
  const intl = useIntl();

  const { result, mutate, isPending } = useSetCollectionRemote();

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: collection.remote
      ? {
          connectorAuthenticationSettings:
            collection.remote.connector.authenticationSettings,
          connectorSettings: collection.remote.connector.settings,
          remoteConverters: collection.latestVersion.remoteConverters!,
        }
      : {
          connectorAuthenticationSettings:
            connector.authenticationStrategy ===
            ConnectorAuthenticationStrategy.ApiKey
              ? { apiKey: undefined }
              : { clientId: undefined, clientSecret: null },
          connectorSettings: forms.defaults.schemaValue(
            connector.settingsSchema,
          ),
          remoteConverters: {
            fromRemoteDocument: forms.defaults.fromRemoteDocument(
              collection.latestVersion.schema,
              connector.remoteDocumentSchema,
            ),
          },
        },
    mode: "onBlur",
    resolver: standardSchemaResolver(
      v.strictObject({
        connectorAuthenticationSettings:
          connector.authenticationStrategy ===
          ConnectorAuthenticationStrategy.ApiKey
            ? v.strictObject({ apiKey: v.pipe(v.string(), v.minLength(1)) })
            : v.strictObject({
                clientId: v.pipe(v.string(), v.minLength(1)),
                clientSecret: v.nullable(v.pipe(v.string(), v.minLength(1))),
              }),
        connectorSettings: valibotSchemas.content(
          connector.settingsSchema,
          "rhf",
        ),
        remoteConverters: v.strictObject({
          fromRemoteDocument: forms.schemas.typescriptModule(intl),
        }),
      }),
    ),
  });

  const onSubmit = handleSubmit(async (values) => {
    const { success, data } = await mutate(
      collection.id,
      connector.name,
      values.connectorAuthenticationSettings,
      RhfContent.fromRhfContent(
        values.connectorSettings,
        connector.settingsSchema,
      ),
      values.remoteConverters,
    );
    if (success) {
      reset({
        connectorAuthenticationSettings:
          data.remote!.connector.authenticationSettings,
        connectorSettings: data.remote!.connector.settings,
        remoteConverters: data.latestVersion.remoteConverters!,
      });
    }
  });

  return (
    <Form onSubmit={onSubmit} className={cs.SetCollectionRemoteForm.root}>
      <AuthenticationSettings
        control={control}
        authenticationStrategy={connector.authenticationStrategy}
      />
      <ConnectorSettings control={control} schema={connector.settingsSchema} />
      <RemoteConverters
        control={control}
        connector={connector}
        collection={collection}
      />
      <div className={cs.SetCollectionRemoteForm.buttons}>
        {authenticateConnectorButton}
        <RHFSubmitButton
          control={control}
          variant="primary"
          isDisabled={isPending}
        >
          {collection.remote ? (
            <FormattedMessage defaultMessage="Update remote" />
          ) : (
            <FormattedMessage defaultMessage="Set remote" />
          )}
        </RHFSubmitButton>
      </div>
      {result?.error ? <ResultErrors errors={[result.error]} /> : null}
    </Form>
  );
}
