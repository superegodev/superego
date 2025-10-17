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

export default ConnectorAuthenticationState;
