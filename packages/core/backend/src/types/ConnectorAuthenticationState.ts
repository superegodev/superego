type ConnectorAuthenticationState =
  // ConnectorAuthenticationStrategy.OAuthPKCE
  {
    accessToken: string;
    refreshToken: string;
  };
export default ConnectorAuthenticationState;
