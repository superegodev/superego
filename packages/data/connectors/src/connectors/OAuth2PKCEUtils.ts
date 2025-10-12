import type Base64Url from "../requirements/Base64Url.js";
import type SessionStorage from "../requirements/SessionStorage.js";
import sha256 from "../utils/sha256.js";

const PKCE_ALLOWED_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
const PKCE_CODE_VERIFIER_LENGTH = 96;
const PKCE_CODE_CHALLENGE_METHOD = "S256" as const;
const NONCE_LENGTH = 32;

export interface AuthorizationStatePayload {
  collectionId: string;
  nonce: string;
}

export interface AuthorizationFlowSessionState {
  codeVerifier: string;
  nonce: string;
}

export async function makePkceParameters(base64Url: Base64Url): Promise<{
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: typeof PKCE_CODE_CHALLENGE_METHOD;
}> {
  const codeVerifier = generateRandomString(PKCE_CODE_VERIFIER_LENGTH);
  const codeChallengeBytes = await sha256(codeVerifier, "bytes");

  return {
    codeVerifier,
    codeChallenge: base64Url.encodeBytes(codeChallengeBytes),
    codeChallengeMethod: PKCE_CODE_CHALLENGE_METHOD,
  };
}

export function generateNonce(): string {
  return generateRandomString(NONCE_LENGTH);
}

export function parseAuthorizationResponseParameters(
  authorizationResponseUrl: string,
): URLSearchParams {
  const parsedUrl = new URL(authorizationResponseUrl);
  const combinedParameters = new URLSearchParams(parsedUrl.search);

  const hash = parsedUrl.hash.startsWith("#")
    ? parsedUrl.hash.slice(1)
    : parsedUrl.hash;
  if (hash.length > 0) {
    const hashParameters = new URLSearchParams(hash);
    hashParameters.forEach((value, key) => {
      if (!combinedParameters.has(key)) {
        combinedParameters.set(key, value);
      }
    });
  }

  return combinedParameters;
}

export function parseAuthorizationState(
  rawState: string | null,
  connectorDisplayName: string,
): AuthorizationStatePayload {
  const errorPrefix = `${connectorDisplayName} OAuth2PKCE`;

  if (typeof rawState !== "string" || rawState.length === 0) {
    throw new Error(`${errorPrefix} response does not include state`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawState);
  } catch {
    throw new Error(`${errorPrefix} state is not valid JSON`);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(`${errorPrefix} state is malformed`);
  }

  const collectionId = expectNonEmptyString(
    (parsed as { collectionId?: unknown }).collectionId,
    "state.collectionId",
  );
  const nonce = expectNonEmptyString(
    (parsed as { nonce?: unknown }).nonce,
    "state.nonce",
  );

  return { collectionId, nonce };
}

export function persistAuthorizationFlowSessionState({
  sessionStorage,
  storageKeyPrefix,
  collectionId,
  codeVerifier,
  nonce,
}: {
  sessionStorage: SessionStorage;
  storageKeyPrefix: string;
  collectionId: string;
  codeVerifier: string;
  nonce: string;
}): void {
  sessionStorage.setItem(
    makeAuthorizationFlowSessionStorageKey(storageKeyPrefix, collectionId),
    JSON.stringify({ codeVerifier, nonce }),
  );
}

export function readAuthorizationFlowSessionState({
  sessionStorage,
  storageKeyPrefix,
  connectorDisplayName,
  collectionId,
}: {
  sessionStorage: SessionStorage;
  storageKeyPrefix: string;
  connectorDisplayName: string;
  collectionId: string;
}): AuthorizationFlowSessionState {
  const errorPrefix = `${connectorDisplayName} OAuth2PKCE`;
  const storageKey = makeAuthorizationFlowSessionStorageKey(
    storageKeyPrefix,
    collectionId,
  );
  const rawValue = sessionStorage.getItem(storageKey);
  if (rawValue === null) {
    throw new Error(
      `${errorPrefix} session state is missing from sessionStorage`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new Error(`${errorPrefix} session state is not valid JSON`);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(`${errorPrefix} session state is malformed`);
  }

  const codeVerifier = expectNonEmptyString(
    (parsed as { codeVerifier?: unknown }).codeVerifier,
    "sessionStorage.codeVerifier",
  );
  const nonce = expectNonEmptyString(
    (parsed as { nonce?: unknown }).nonce,
    "sessionStorage.nonce",
  );

  return { codeVerifier, nonce };
}

export function clearAuthorizationFlowSessionState({
  sessionStorage,
  storageKeyPrefix,
  collectionId,
}: {
  sessionStorage: SessionStorage;
  storageKeyPrefix: string;
  collectionId: string;
}): void {
  sessionStorage.setItem(
    makeAuthorizationFlowSessionStorageKey(storageKeyPrefix, collectionId),
    null,
  );
}

function makeAuthorizationFlowSessionStorageKey(
  storageKeyPrefix: string,
  collectionId: string,
): string {
  return `${storageKeyPrefix}:${collectionId}`;
}

function generateRandomString(length: number): string {
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  const characterCount = PKCE_ALLOWED_CHARACTERS.length;

  let value = "";
  for (const randomValue of randomValues) {
    value += PKCE_ALLOWED_CHARACTERS.charAt(randomValue % characterCount);
  }
  return value;
}

function expectNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  throw new Error(`Expected ${fieldName} to be a non-empty string`);
}
