import {
  type Connector,
  type ConnectorAuthenticationSettings,
  type ConnectorAuthenticationState,
  ConnectorAuthenticationStrategy,
} from "@superego/backend";
import { valibotSchemas as schemaValibotSchemas } from "@superego/schema";
import * as v from "valibot";

export function connector(): v.GenericSchema<unknown, Connector> {
  return v.strictObject({
    name: v.string(),
    authenticationStrategy: v.picklist(
      Object.values(ConnectorAuthenticationStrategy),
    ),
    settingsSchema: v.nullable(schemaValibotSchemas.schema()),
    remoteDocumentTypescriptSchema: v.strictObject({
      types: v.string(),
      rootType: v.string(),
    }),
  });
}

export function connectorAuthenticationSettings(): v.GenericSchema<
  unknown,
  ConnectorAuthenticationSettings
> {
  return v.union([
    v.strictObject({ apiKey: v.string() }),
    v.strictObject({
      clientId: v.string(),
      clientSecret: v.nullable(v.string()),
    }),
  ]) as v.GenericSchema<unknown, ConnectorAuthenticationSettings>;
}

export function connectorAuthenticationState(): v.GenericSchema<
  unknown,
  ConnectorAuthenticationState
> {
  return v.union([
    v.null(),
    v.strictObject({
      accessToken: v.string(),
      refreshToken: v.string(),
      accessTokenExpiresAt: v.date(),
    }),
  ]) as v.GenericSchema<unknown, ConnectorAuthenticationState>;
}
