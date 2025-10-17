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

export default ConnectorAuthenticationSettings;
