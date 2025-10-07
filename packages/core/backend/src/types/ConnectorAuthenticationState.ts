type ConnectorAuthenticationState =
  // ConnectorAuthenticationStrategy.OAuth2
  {
    email: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
  };
export default ConnectorAuthenticationState;
