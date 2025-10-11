import {
  type ConnectorAuthenticationFailed,
  type ConnectorAuthenticationSettings,
  type ConnectorAuthenticationState,
  ConnectorAuthenticationStrategy,
  type UnexpectedError,
} from "@superego/backend";
import type { Connector } from "@superego/executing-backend";
import type Base64Url from "../../requirements/Base64Url.js";
import type SessionStorage from "../../requirements/SessionStorage.js";
import defineConnector from "../../utils/defineConnector.js";
import sha256 from "../../utils/sha256.js";
import {
  ACCESS_TOKEN_EXPIRATION_BUFFER,
  REDIRECT_URI,
  STRAVA_ACTIVITIES_ENDPOINT,
  STRAVA_ACTIVITIES_PAGE_SIZE,
  STRAVA_ACTIVITY_DETAIL_ENDPOINT,
  STRAVA_OAUTH_AUTHORIZATION_ENDPOINT,
  STRAVA_OAUTH_TOKEN_ENDPOINT,
} from "./constants.js";
import {
  StravaAccessTokenExpiredError,
  StravaAuthenticationFailedError,
  StravaRateLimitedError,
} from "./errors.js";
import type {
  DetailedActivity,
  SummaryActivity,
} from "./remoteDocumentTypes.js";
import remoteDocumentTypes from "./remoteDocumentTypes.js?raw";

interface StravaOAuthTokenResponseBody {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  athlete?: {
    id?: number;
    username?: string;
  };
  error?: string;
  errors?: unknown;
  message?: string;
}

const PKCE_ALLOWED_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
const PKCE_CODE_VERIFIER_LENGTH = 96;
const PKCE_CODE_CHALLENGE_METHOD = "S256";
const NONCE_LENGTH = 32;
const AUTHORIZATION_FLOW_SESSION_STORAGE_KEY_PREFIX =
  "StravaActivitiesConnector";

interface Options {
  redirectUri: string;
  base64Url: Base64Url;
  sessionStorage: SessionStorage;
}

export default defineConnector((options: Options) => ({
  name: "StravaActivities",

  authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,

  settingsSchema: null,

  remoteDocumentTypescriptSchema: {
    types: remoteDocumentTypes,
    rootType: "DetailedActivity",
  },

  async getAuthorizationRequestUrl({ collectionId, authenticationSettings }) {
    const pkceParameters = await makePkceParameters(options.base64Url);
    const nonce = generateNonce();
    persistAuthorizationFlowSessionState({
      sessionStorage: options.sessionStorage,
      collectionId,
      codeVerifier: pkceParameters.codeVerifier,
      nonce,
    });

    const url = new URL(STRAVA_OAUTH_AUTHORIZATION_ENDPOINT);
    url.searchParams.set("client_id", authenticationSettings.clientId);
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("approval_prompt", "force");
    url.searchParams.set("scope", "activity:read_all");
    url.searchParams.set("code_challenge", pkceParameters.codeChallenge);
    url.searchParams.set(
      "code_challenge_method",
      pkceParameters.codeChallengeMethod,
    );
    url.searchParams.set("state", JSON.stringify({ collectionId, nonce }));
    return url.toString();
  },

  async getAuthenticationState({
    authenticationSettings,
    authorizationResponseUrl,
  }) {
    let authorizationState: AuthorizationStatePayload | null = null;
    try {
      const authorizationParameters = parseAuthorizationResponseParameters(
        authorizationResponseUrl,
      );
      authorizationState = parseAuthorizationState(
        authorizationParameters.get("state"),
      );
      const flowSessionState = readAuthorizationFlowSessionState({
        sessionStorage: options.sessionStorage,
        collectionId: authorizationState.collectionId,
      });
      if (flowSessionState.nonce !== authorizationState.nonce) {
        throw new Error(
          "Strava OAuth2PKCE nonce does not match the expected value",
        );
      }
      const authorizationCode = authorizationParameters.get("code");
      if (
        typeof authorizationCode !== "string" ||
        authorizationCode.length === 0
      ) {
        throw new Error("Strava OAuth2PKCE response does not include code");
      }

      const exchangedTokens = await exchangeAuthorizationCodeForTokens({
        authorizationCode,
        authenticationSettings,
        codeVerifier: flowSessionState.codeVerifier,
      });

      if (!exchangedTokens.refreshToken) {
        throw new Error(
          "Strava OAuth2PKCE token response does not include refresh_token",
        );
      }

      return makeSuccessfulResult({
        email: exchangedTokens.athleteUsername ?? "",
        accessToken: exchangedTokens.accessToken,
        refreshToken: exchangedTokens.refreshToken,
        accessTokenExpiresAt: exchangedTokens.accessTokenExpiresAt,
      });
    } catch (error) {
      return makeUnexpectedError(error);
    } finally {
      if (authorizationState !== null) {
        clearAuthorizationFlowSessionState({
          sessionStorage: options.sessionStorage,
          collectionId: authorizationState.collectionId,
        });
      }
    }
  },

  async syncDown({ authenticationSettings, authenticationState, syncFrom }) {
    try {
      let currentAuthenticationState = await ensureValidAccessToken({
        authenticationSettings,
        authenticationState,
      });
      const currentSyncCursor = syncFrom;

      while (true) {
        try {
          const { changes, nextSyncCursor } = await downloadActivities({
            accessToken: currentAuthenticationState.accessToken,
            syncCursor: currentSyncCursor,
          });

          return makeSuccessfulResult({
            changes,
            authenticationState: currentAuthenticationState,
            syncPoint: nextSyncCursor,
          });
        } catch (error) {
          if (error instanceof StravaAccessTokenExpiredError) {
            currentAuthenticationState = await refreshAccessToken({
              authenticationSettings,
              authenticationState: currentAuthenticationState,
            });
            continue;
          }

          throw error;
        }
      }
    } catch (error) {
      if (error instanceof StravaAuthenticationFailedError) {
        return makeConnectorAuthenticationFailed(error.reason);
      }
      return makeUnexpectedError(error);
    }
  },
}));

///////////
// Utils //
///////////

function parseAuthorizationResponseParameters(
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

async function makePkceParameters(base64Url: Base64Url): Promise<{
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: string;
}> {
  const codeVerifier = generatePkceCodeVerifier();
  const codeChallengeBytes = await sha256(codeVerifier, "bytes");

  return {
    codeVerifier,
    codeChallenge: base64Url.encodeBytes(codeChallengeBytes),
    codeChallengeMethod: PKCE_CODE_CHALLENGE_METHOD,
  };
}

function generatePkceCodeVerifier(): string {
  return generateRandomString(PKCE_CODE_VERIFIER_LENGTH);
}

function generateNonce(): string {
  return generateRandomString(NONCE_LENGTH);
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

interface AuthorizationStatePayload {
  collectionId: string;
  nonce: string;
}

function parseAuthorizationState(
  rawState: string | null,
): AuthorizationStatePayload {
  if (typeof rawState !== "string" || rawState.length === 0) {
    throw new Error("Strava OAuth2PKCE response does not include state");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawState);
  } catch {
    throw new Error("Strava OAuth2PKCE state is not valid JSON");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Strava OAuth2PKCE state is malformed");
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

async function exchangeAuthorizationCodeForTokens({
  authorizationCode,
  authenticationSettings,
  codeVerifier,
}: {
  authorizationCode: string;
  authenticationSettings: ConnectorAuthenticationSettings.OAuth2PKCE;
  codeVerifier: string;
}): Promise<{
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpiresAt: Date;
  athleteUsername: string | null;
}> {
  if (!authenticationSettings.clientSecret) {
    throw new Error(
      "Strava OAuth2PKCE requires clientSecret to exchange authorization code",
    );
  }

  const body = new URLSearchParams({
    client_id: authenticationSettings.clientId,
    client_secret: authenticationSettings.clientSecret,
    code: authorizationCode,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const response = await fetch(STRAVA_OAUTH_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorDetail = await readErrorResponse(response);
    throw new Error(
      `Strava OAuth2PKCE token exchange failed (${response.status}): ${errorDetail}`,
    );
  }

  const json = (await response.json()) as StravaOAuthTokenResponseBody;
  const accessToken = expectNonEmptyString(json.access_token, "access_token");
  const refreshToken =
    typeof json.refresh_token === "string" && json.refresh_token.length > 0
      ? json.refresh_token
      : null;
  const expiresAt = expectNumber(json.expires_at, "expires_at");

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: computeAccessTokenExpiration(expiresAt),
    athleteUsername:
      typeof json.athlete?.username === "string" ? json.athlete.username : null,
  };
}

async function ensureValidAccessToken({
  authenticationSettings,
  authenticationState,
}: {
  authenticationSettings: ConnectorAuthenticationSettings.OAuth2PKCE;
  authenticationState: ConnectorAuthenticationState.OAuth2PKCE | null;
}): Promise<ConnectorAuthenticationState.OAuth2PKCE> {
  if (
    authenticationState === null ||
    !authenticationState.accessToken ||
    !authenticationState.refreshToken ||
    !authenticationState.accessTokenExpiresAt
  ) {
    throw new StravaAuthenticationFailedError(
      "Missing authentication state for Strava connector",
    );
  }

  const expiration = new Date(authenticationState.accessTokenExpiresAt);
  if (Number.isNaN(expiration.getTime())) {
    throw new StravaAuthenticationFailedError(
      "Strava authentication state contains invalid expiration timestamp",
    );
  }

  if (isAccessTokenExpiring(expiration)) {
    return refreshAccessToken({
      authenticationSettings,
      authenticationState,
    });
  }

  return authenticationState;
}

function isAccessTokenExpiring(expiration: Date): boolean {
  return expiration.getTime() - Date.now() <= ACCESS_TOKEN_EXPIRATION_BUFFER;
}

async function refreshAccessToken({
  authenticationSettings,
  authenticationState,
}: {
  authenticationSettings: ConnectorAuthenticationSettings.OAuth2PKCE;
  authenticationState: ConnectorAuthenticationState.OAuth2PKCE;
}): Promise<ConnectorAuthenticationState.OAuth2PKCE> {
  if (!authenticationSettings.clientSecret) {
    throw new StravaAuthenticationFailedError(
      "Strava OAuth2PKCE requires clientSecret to refresh the token",
    );
  }
  if (!authenticationState.refreshToken) {
    throw new StravaAuthenticationFailedError(
      "Strava authentication state missing refresh token",
    );
  }

  const body = new URLSearchParams({
    client_id: authenticationSettings.clientId,
    client_secret: authenticationSettings.clientSecret,
    grant_type: "refresh_token",
    refresh_token: authenticationState.refreshToken,
  });

  const response = await fetch(STRAVA_OAUTH_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorDetail = await readErrorResponse(response);
    if (response.status === 400 || response.status === 401) {
      throw new StravaAuthenticationFailedError(errorDetail);
    }
    throw new Error(
      `Strava OAuth2PKCE refresh token request failed (${response.status}): ${errorDetail}`,
    );
  }

  const json = (await response.json()) as StravaOAuthTokenResponseBody;
  const accessToken = expectNonEmptyString(json.access_token, "access_token");
  const expiresAt = expectNumber(json.expires_at, "expires_at");

  return {
    ...authenticationState,
    accessToken,
    accessTokenExpiresAt: computeAccessTokenExpiration(expiresAt),
    refreshToken:
      typeof json.refresh_token === "string" && json.refresh_token.length > 0
        ? json.refresh_token
        : authenticationState.refreshToken,
  };
}

async function downloadActivities({
  accessToken,
  syncCursor,
}: {
  accessToken: string;
  syncCursor: string | null;
}): Promise<{
  changes: Connector.Changes<DetailedActivity>;
  nextSyncCursor: string;
}> {
  const aggregatedChanges: Connector.Changes<DetailedActivity> = {
    addedOrModified: [],
    deleted: [],
  };

  const syncCursorDate = parseSyncCursor(syncCursor);
  let latestUpdatedAt: string | null = syncCursor ?? null;
  let page = 1;

  while (true) {
    const summaries = await fetchActivitiesPage({
      accessToken,
      page,
    });

    if (!Array.isArray(summaries) || summaries.length === 0) {
      break;
    }

    let pageContainsUpdates = false;

    for (const summary of summaries) {
      if (typeof summary !== "object" || summary === null) {
        continue;
      }

      const activityId = expectNumber(summary.id, "activity.id");
      let detailedResponse: FetchedDetailedActivity;
      try {
        detailedResponse = await fetchDetailedActivity({
          accessToken,
          activityId,
        });
      } catch (error) {
        if (error instanceof StravaRateLimitedError) {
          const resolvedNextSyncCursor =
            latestUpdatedAt ?? syncCursor ?? new Date(0).toISOString();
          return {
            changes: aggregatedChanges,
            nextSyncCursor: resolvedNextSyncCursor,
          };
        }
        throw error;
      }
      const { activity: detailed, etag } = detailedResponse;
      const updatedAt = extractUpdatedAt(detailed);

      if (
        !syncCursorDate ||
        new Date(updatedAt).getTime() > syncCursorDate.getTime()
      ) {
        aggregatedChanges.addedOrModified.push({
          id: String(activityId),
          versionId: deriveActivityVersionId(detailed, etag),
          content: detailed,
        });
        pageContainsUpdates = true;
      }

      if (
        latestUpdatedAt === null ||
        compareIsoTimestamps(updatedAt, latestUpdatedAt) > 0
      ) {
        latestUpdatedAt = updatedAt;
      }
    }

    if (summaries.length < STRAVA_ACTIVITIES_PAGE_SIZE) {
      break;
    }

    if (!pageContainsUpdates && syncCursorDate !== null) {
      break;
    }

    page += 1;
  }

  const nextSyncCursor =
    latestUpdatedAt ?? syncCursor ?? new Date(0).toISOString();

  return {
    changes: aggregatedChanges,
    nextSyncCursor,
  };
}

async function fetchActivitiesPage({
  accessToken,
  page,
}: {
  accessToken: string;
  page: number;
}): Promise<SummaryActivity[]> {
  const url = new URL(STRAVA_ACTIVITIES_ENDPOINT);
  url.searchParams.set("per_page", String(STRAVA_ACTIVITIES_PAGE_SIZE));
  url.searchParams.set("page", String(page));

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    throw new StravaAccessTokenExpiredError();
  }

  if (response.status === 429) {
    throw new StravaRateLimitedError(parseRetryAfterSeconds(response));
  }

  if (!response.ok) {
    const errorDetail = await readErrorResponse(response);
    throw new Error(
      `Strava activities request failed (${response.status}): ${errorDetail}`,
    );
  }

  const json = (await response.json()) as unknown;
  if (!Array.isArray(json)) {
    throw new Error("Strava activities response is not an array");
  }
  return json as SummaryActivity[];
}

interface FetchedDetailedActivity {
  activity: DetailedActivity;
  etag: string | null;
}

async function fetchDetailedActivity({
  accessToken,
  activityId,
}: {
  accessToken: string;
  activityId: number;
}): Promise<FetchedDetailedActivity> {
  const url = new URL(
    `${STRAVA_ACTIVITY_DETAIL_ENDPOINT}/${encodeURIComponent(
      String(activityId),
    )}`,
  );
  url.searchParams.set("include_all_efforts", "true");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    throw new StravaAccessTokenExpiredError();
  }

  if (response.status === 429) {
    throw new StravaRateLimitedError(parseRetryAfterSeconds(response));
  }

  if (!response.ok) {
    const errorDetail = await readErrorResponse(response);
    throw new Error(
      `Strava activity detail request failed (${response.status}): ${errorDetail}`,
    );
  }

  const json = (await response.json()) as unknown;
  if (typeof json !== "object" || json === null) {
    throw new Error("Strava activity detail response is not an object");
  }
  return {
    activity: json as DetailedActivity,
    etag: response.headers.get("etag"),
  };
}

function extractUpdatedAt(activity: DetailedActivity): string {
  const rawActivity = activity as Record<string, unknown>;
  const candidates: Array<string | Date | null> = [
    typeof rawActivity["updated_at"] === "string"
      ? (rawActivity["updated_at"] as string)
      : null,
    typeof rawActivity["start_date"] === "string"
      ? (rawActivity["start_date"] as string)
      : null,
    typeof rawActivity["start_date_local"] === "string"
      ? (rawActivity["start_date_local"] as string)
      : null,
    activity.startDate ?? null,
    activity.startDateLocal ?? null,
  ];

  for (const candidate of candidates) {
    if (candidate instanceof Date && !Number.isNaN(candidate.valueOf())) {
      return candidate.toISOString();
    }
    if (typeof candidate === "string") {
      const timestamp = Date.parse(candidate);
      if (!Number.isNaN(timestamp)) {
        return new Date(timestamp).toISOString();
      }
    }
  }

  return new Date(0).toISOString();
}

function deriveActivityVersionId(
  activity: DetailedActivity,
  etag: string | null,
): string {
  if (typeof etag === "string" && etag.length > 0) {
    return etag;
  }

  const candidates: Array<unknown> = [
    activity.startDate,
    activity.startDateLocal,
    activity.id,
  ];

  for (const candidate of candidates) {
    if (candidate instanceof Date && !Number.isNaN(candidate.valueOf())) {
      return candidate.toISOString();
    }
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return String(candidate);
    }
  }

  throw new Error(
    "Strava activity is missing fields that can serve as versionId",
  );
}

function compareIsoTimestamps(a: string, b: string): number {
  const parsedA = Date.parse(a);
  const parsedB = Date.parse(b);
  if (Number.isNaN(parsedA) || Number.isNaN(parsedB)) {
    return 0;
  }
  if (parsedA === parsedB) {
    return 0;
  }
  return parsedA > parsedB ? 1 : -1;
}

function parseSyncCursor(syncCursor: string | null): Date | null {
  if (syncCursor === null) {
    return null;
  }
  const parsed = Date.parse(syncCursor);
  if (Number.isNaN(parsed)) {
    throw new Error("Strava sync cursor is not a valid ISO timestamp");
  }
  return new Date(parsed);
}

function computeAccessTokenExpiration(expiresAtEpochSeconds: number): Date {
  return new Date(expiresAtEpochSeconds * 1000);
}

interface AuthorizationFlowSessionState {
  codeVerifier: string;
  nonce: string;
}

function makeAuthorizationFlowSessionStorageKey(collectionId: string): string {
  return `${AUTHORIZATION_FLOW_SESSION_STORAGE_KEY_PREFIX}:${collectionId}`;
}

function persistAuthorizationFlowSessionState({
  sessionStorage,
  collectionId,
  codeVerifier,
  nonce,
}: {
  sessionStorage: SessionStorage;
  collectionId: string;
  codeVerifier: string;
  nonce: string;
}): void {
  sessionStorage.setItem(
    makeAuthorizationFlowSessionStorageKey(collectionId),
    JSON.stringify({ codeVerifier, nonce }),
  );
}

function readAuthorizationFlowSessionState({
  sessionStorage,
  collectionId,
}: {
  sessionStorage: SessionStorage;
  collectionId: string;
}): AuthorizationFlowSessionState {
  const rawValue = sessionStorage.getItem(
    makeAuthorizationFlowSessionStorageKey(collectionId),
  );
  if (rawValue === null) {
    throw new Error(
      "Strava OAuth2PKCE session state is missing from sessionStorage",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new Error("Strava OAuth2PKCE session state is not valid JSON");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Strava OAuth2PKCE session state is malformed");
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

function clearAuthorizationFlowSessionState({
  sessionStorage,
  collectionId,
}: {
  sessionStorage: SessionStorage;
  collectionId: string;
}): void {
  sessionStorage.setItem(
    makeAuthorizationFlowSessionStorageKey(collectionId),
    null,
  );
}

async function readErrorResponse(response: Response): Promise<string> {
  try {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text) as unknown;
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        typeof (parsed as { message?: unknown }).message === "string"
      ) {
        const message = (parsed as { message: string }).message;
        if (
          Array.isArray((parsed as { errors?: unknown }).errors) &&
          (parsed as { errors: unknown[] }).errors.length > 0
        ) {
          return `${message}: ${JSON.stringify(
            (parsed as { errors: unknown[] }).errors,
          )}`;
        }
        return message;
      }

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        typeof (parsed as { error?: unknown }).error === "string"
      ) {
        return (parsed as { error: string }).error;
      }

      return text;
    } catch {
      return text;
    }
  } catch {
    return "<unparseable>";
  }
}

function parseRetryAfterSeconds(response: Response): number | null {
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter === null) {
    return null;
  }
  const parsed = Number.parseInt(retryAfter, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function expectNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  throw new Error(`Expected ${fieldName} to be a non-empty string`);
}

function expectNumber(value: unknown, fieldName: string): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  throw new Error(`Expected ${fieldName} to be a number`);
}

function makeSuccessfulResult<Data>(data: Data) {
  return {
    success: true as const,
    data,
    error: null,
  };
}

function makeUnexpectedError(error: unknown): {
  success: false;
  data: null;
  error: UnexpectedError;
} {
  return {
    success: false as const,
    data: null,
    error: {
      name: "UnexpectedError",
      details: {
        cause: serializeErrorCause(error),
      },
    },
  };
}

function makeConnectorAuthenticationFailed(reason: string): {
  success: false;
  data: null;
  error: ConnectorAuthenticationFailed;
} {
  return {
    success: false as const,
    data: null,
    error: {
      name: "ConnectorAuthenticationFailed",
      details: {
        reason,
      },
    },
  };
}

function serializeErrorCause(error: unknown): unknown {
  if (error instanceof StravaAuthenticationFailedError) {
    return {
      name: error.name,
      message: error.message,
      reason: error.reason,
    };
  }

  if (error instanceof StravaAccessTokenExpiredError) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  if (error instanceof StravaRateLimitedError) {
    return {
      name: error.name,
      message: error.message,
      retryAfterSeconds: error.retryAfterSeconds,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? null,
    };
  }

  return error;
}
