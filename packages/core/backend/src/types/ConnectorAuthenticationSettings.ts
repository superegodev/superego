namespace ConnectorAuthenticationSettings {
  export interface ApiKey {
    apiKey: string;
  }

  export interface OAuth2 {
    clientId: string;
    clientSecret: string;
  }
}

type ConnectorAuthenticationSettings =
  | ConnectorAuthenticationSettings.ApiKey
  | ConnectorAuthenticationSettings.OAuth2;

export default ConnectorAuthenticationSettings;
