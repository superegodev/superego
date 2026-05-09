import * as v from "valibot";

namespace ConnectorAuthenticationSettings {
  export interface ApiKey {
    apiKey: string;
  }

  export interface OAuth2PKCE {
    clientId: string;
    clientSecret: string | null;
  }
}

type ConnectorAuthenticationSettings =
  | ConnectorAuthenticationSettings.ApiKey
  | ConnectorAuthenticationSettings.OAuth2PKCE;

const apiKeySchema: v.GenericSchema<ConnectorAuthenticationSettings.ApiKey> =
  v.object({ apiKey: v.string() });
const oauth2PkceSchema: v.GenericSchema<ConnectorAuthenticationSettings.OAuth2PKCE> =
  v.object({
    clientId: v.string(),
    clientSecret: v.nullable(v.string()),
  });

const ConnectorAuthenticationSettingsSchema: v.GenericSchema<ConnectorAuthenticationSettings> =
  v.union([apiKeySchema, oauth2PkceSchema]);
export default ConnectorAuthenticationSettingsSchema;
export type { ConnectorAuthenticationSettings };
