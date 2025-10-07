type ConnectorAuthenticationSettings =
  // ConnectorAuthenticationStrategy.OAuthPKCE
  {
    discoveryEndpoint: string;
    clientId: string;
    scopes: string[];
  };
export default ConnectorAuthenticationSettings;
