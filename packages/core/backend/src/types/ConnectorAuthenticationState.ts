type ConnectorAuthenticationState =
  // ConnectorAuthenticationStrategy.OAuthPKCE
  {
    email: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
  };
export default ConnectorAuthenticationState;
