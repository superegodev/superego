export class OAuth2PKCEInvalidStateParam extends Error {
  override name = "OAuth2PKCEInvalidStateParam";
}

export class OAuth2PKCECodeVerifierNotFound extends Error {
  override name = "OAuth2PKCECodeVerifierNotFound";
  constructor(
    public connectorName: string,
    public nonce: string,
  ) {
    super(
      `No code verifier found in storage. Connector = "${connectorName}", nonce "${nonce}".`,
    );
  }
}

export class OAuth2PKCECodeParamNotFound extends Error {
  override name = "OAuth2PKCECodeParamNotFound";
}

export class OAuth2PKCEGetAuthenticationStateFailed extends Error {
  override name = "OAuth2PKCEGetAuthenticationStateFailed";
  constructor(public override cause: any) {
    super();
  }
}

export class OAuth2PKCERefreshAuthenticationStateFailed extends Error {
  override name = "OAuth2PKCERefreshAuthenticationStateFailed";
  constructor(public override cause: any) {
    super();
  }
}

export class OAuth2PKCEAccessTokenNotValid extends Error {
  override name = "OAuth2PKCEAccessTokenNotValid";
}
