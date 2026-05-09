import * as v from "valibot";

namespace ConnectorAuthenticationState {
  export type ApiKey = null;

  export interface OAuth2PKCE {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
  }
}

type ConnectorAuthenticationState =
  | ConnectorAuthenticationState.ApiKey
  | ConnectorAuthenticationState.OAuth2PKCE;

const apiKeySchema: v.GenericSchema<ConnectorAuthenticationState.ApiKey> =
  v.null();
const oauth2PkceSchema: v.GenericSchema<ConnectorAuthenticationState.OAuth2PKCE> =
  v.object({
    accessToken: v.string(),
    refreshToken: v.string(),
    accessTokenExpiresAt: v.date(),
  });

const ConnectorAuthenticationStateSchema: v.GenericSchema<ConnectorAuthenticationState> =
  v.union([apiKeySchema, oauth2PkceSchema]);
export default ConnectorAuthenticationStateSchema;
export type { ConnectorAuthenticationState };
