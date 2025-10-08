namespace ConnectorAuthenticationState {
  export type ApiKey = null;

  export interface OAuth2 {
    email: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
  }
}

type ConnectorAuthenticationState =
  | ConnectorAuthenticationState.ApiKey
  | ConnectorAuthenticationState.OAuth2;

export default ConnectorAuthenticationState;
