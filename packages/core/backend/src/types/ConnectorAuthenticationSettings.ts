type ConnectorAuthenticationSettings =
  // ConnectorAuthenticationStrategy.OAuthPKCE
  {
    url: string;
    clientId: string;
    scopes: string[];
  };
export default ConnectorAuthenticationSettings;
