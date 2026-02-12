import {
  type CollectionId,
  type ConnectorAuthenticationSettings,
  type ConnectorAuthenticationState,
  ConnectorAuthenticationStrategy,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  Base64Url,
  extractErrorDetails,
  failedResponseToError,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import type SessionStorage from "../../requirements/SessionStorage.js";
import sha256 from "../../utils/sha256.js";
import CodeVerifierStorage from "./CodeVerifierStorage.js";
import {
  OAuth2PKCECodeParamNotFound,
  OAuth2PKCEGetAuthenticationStateFailed,
  OAuth2PKCERefreshAuthenticationStateFailed,
} from "./errors.js";
import UrlState from "./UrlState.js";

export default class OAuth2PKCEConnector {
  private codeVerifierStorage: CodeVerifierStorage;
  constructor(
    public name: string,
    private redirectUri: string,
    sessionStorage: SessionStorage,
    private options: {
      scopes: string[];
      authorizationEndpoint: string;
      tokenEndpoint: string;
    },
  ) {
    this.codeVerifierStorage = new CodeVerifierStorage(sessionStorage, name);
  }

  authenticationStrategy = ConnectorAuthenticationStrategy.OAuth2PKCE as const;

  async getAuthorizationRequestUrl({
    collectionId,
    authenticationSettings,
  }: {
    collectionId: CollectionId;
    authenticationSettings: ConnectorAuthenticationSettings.OAuth2PKCE;
  }): Promise<string> {
    const codeVerifier = OAuth2PKCEConnector.codeVerifier();
    const nonce = OAuth2PKCEConnector.nonce();
    this.codeVerifierStorage.write(nonce, codeVerifier);

    const url = new URL(this.options.authorizationEndpoint);
    url.searchParams.set("client_id", authenticationSettings.clientId);
    url.searchParams.set("scope", this.options.scopes.join(" "));
    url.searchParams.set("redirect_uri", this.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set(
      "code_challenge",
      Base64Url.encodeBytes(await sha256(codeVerifier, "bytes")),
    );
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("state", UrlState.stringify({ collectionId, nonce }));
    return url.toString();
  }

  async getAuthenticationState({
    authenticationSettings,
    authorizationResponseUrl,
  }: {
    authenticationSettings: ConnectorAuthenticationSettings.OAuth2PKCE;
    authorizationResponseUrl: string;
  }): ResultPromise<ConnectorAuthenticationState.OAuth2PKCE, UnexpectedError> {
    try {
      const params = this.parseAuthorizationResponseUrlParams(
        authorizationResponseUrl,
      );

      const authorizationCode = params.get("code");
      if (!authorizationCode) {
        throw new OAuth2PKCECodeParamNotFound();
      }

      const { nonce } = UrlState.parse(params.get("state"));
      const codeVerifier = this.codeVerifierStorage.read(nonce);
      this.codeVerifierStorage.clear(nonce);

      const authenticationState =
        await this.getAuthenticationStateFromTokenEndpoint(
          new URLSearchParams({
            grant_type: "authorization_code",
            code: authorizationCode,
            code_verifier: codeVerifier,
            redirect_uri: this.redirectUri,
            client_id: authenticationSettings.clientId,
            ...(authenticationSettings.clientSecret
              ? { client_secret: authenticationSettings.clientSecret }
              : {}),
          }),
          OAuth2PKCEGetAuthenticationStateFailed,
        );

      return makeSuccessfulResult(authenticationState);
    } catch (error) {
      return makeUnsuccessfulResult({
        name: "UnexpectedError",
        details: { cause: extractErrorDetails(error) },
      });
    }
  }

  protected async getFreshAuthenticationState({
    authenticationSettings,
    authenticationState,
  }: {
    authenticationSettings: ConnectorAuthenticationSettings.OAuth2PKCE;
    authenticationState: ConnectorAuthenticationState.OAuth2PKCE;
  }): Promise<ConnectorAuthenticationState.OAuth2PKCE> {
    const accessTokenExpirationBuffer = 60_000;
    return authenticationState.accessTokenExpiresAt.getTime() - Date.now() >
      accessTokenExpirationBuffer
      ? authenticationState
      : this.refreshAuthenticationState({
          authenticationSettings,
          authenticationState,
        });
  }

  protected async refreshAuthenticationState({
    authenticationSettings,
    authenticationState,
  }: {
    authenticationSettings: ConnectorAuthenticationSettings.OAuth2PKCE;
    authenticationState: ConnectorAuthenticationState.OAuth2PKCE;
  }): Promise<ConnectorAuthenticationState.OAuth2PKCE> {
    return this.getAuthenticationStateFromTokenEndpoint(
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: authenticationState.refreshToken,
        client_id: authenticationSettings.clientId,
        ...(authenticationSettings.clientSecret
          ? { client_secret: authenticationSettings.clientSecret }
          : {}),
      }),
      OAuth2PKCERefreshAuthenticationStateFailed,
    );
  }

  private async getAuthenticationStateFromTokenEndpoint(
    requestBody: URLSearchParams,
    ErrorClass:
      | typeof OAuth2PKCEGetAuthenticationStateFailed
      | typeof OAuth2PKCERefreshAuthenticationStateFailed,
  ): Promise<ConnectorAuthenticationState.OAuth2PKCE> {
    const response = await fetch(this.options.tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: requestBody.toString(),
    });

    if (!response.ok) {
      throw new ErrorClass(
        await failedResponseToError("POST", requestBody.toString(), response),
      );
    }

    let responseBody: any;
    try {
      responseBody = await response.json();
    } catch (error) {
      throw new ErrorClass(error);
    }

    const {
      success,
      output: validResponseBody,
      issues,
    } = v.safeParse(
      v.object({
        access_token: v.pipe(v.string(), v.minLength(1)),
        refresh_token: v.pipe(v.string(), v.minLength(1)),
        expires_in: v.pipe(v.number(), v.integer()),
      }),
      responseBody,
    );
    if (!success) {
      throw new ErrorClass(new v.ValiError(issues));
    }

    return {
      accessToken: validResponseBody.access_token,
      refreshToken: validResponseBody.refresh_token,
      accessTokenExpiresAt: new Date(
        Date.now() + validResponseBody.expires_in * 1_000,
      ),
    };
  }

  /**
   * Parse OAuth2 response params from both query and fragment. Normally, code
   * flow uses query (?code=...), and implicit flow uses fragment
   * (#access_token=...). Some providers or response_mode settings vary, so we
   * merge both to be robust. Spec doesn't require both; this just tolerates
   * nonstandard or mixed responses.
   */
  private parseAuthorizationResponseUrlParams(
    authorizationResponseUrl: string,
  ): URLSearchParams {
    const url = new URL(authorizationResponseUrl);
    const query = new URLSearchParams(url.search);
    const fragment = new URLSearchParams(
      url.hash.startsWith("#") ? url.hash.slice(1) : url.hash,
    );
    return new URLSearchParams([
      ...Array.from(query),
      ...Array.from(fragment).filter(([k]) => !query.has(k)),
    ]);
  }

  private static codeVerifier(): string {
    const codeVerifierLength = 96;
    return OAuth2PKCEConnector.randomString(codeVerifierLength);
  }

  private static nonce(): string {
    const nonceLength = 32;
    return OAuth2PKCEConnector.randomString(nonceLength);
  }

  private static randomString(length: number): string {
    // Alphabet satisfies:
    // - Only contains PKCE-allowed characters.
    // - Contains 64 characters, to avoid modulo bias.
    const alphabet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    return Array.from(
      crypto.getRandomValues(new Uint8Array(length)),
      (byte) => alphabet[byte & 63],
    ).join("");
  }
}
