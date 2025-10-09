import {
  type ConnectorAuthenticationFailed,
  type ConnectorAuthenticationSettings,
  type ConnectorAuthenticationState,
  ConnectorAuthenticationStrategy,
  type UnexpectedError,
} from "@superego/backend";
import { DataType } from "@superego/schema";
import Base64Url from "../utils/Base64Url.js";
import defineConnector from "../utils/defineConnector.js";
import {
  ACCESS_TOKEN_EXPIRATION_BUFFER,
  GOOGLE_CALENDAR_EVENTS_ENDPOINT_BASE,
  GOOGLE_CALENDAR_FULL_SYNC_TIME_MIN,
  GOOGLE_CALENDAR_PAGE_SIZE,
  GOOGLE_OAUTH2_AUTHORIZATION_ENDPOINT,
  GOOGLE_OAUTH2_TOKEN_ENDPOINT,
  REDIRECT_URI,
} from "./constants.js";
import EventSchema from "./EventSchema.js";
import {
  GoogleCalendarAccessTokenExpiredError,
  GoogleCalendarAuthenticationFailedError,
  GoogleCalendarSyncTokenExpiredError,
} from "./errors.js";
import makeRemoteDocument from "./makeRemoteDocument.js";
import type {
  GoogleCalendarEvent,
  GoogleCalendarEventsResponse,
} from "./types.js";

interface GoogleOAuth2PKCETokenResponseBody {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

type RemoteEventDocument = ReturnType<typeof makeRemoteDocument>;

interface CalendarChanges {
  addedOrModified: {
    id: string;
    versionId: string;
    content: RemoteEventDocument;
  }[];
  deleted: {
    id: string;
  }[];
}

const PKCE_ALLOWED_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
const PKCE_CODE_VERIFIER_LENGTH = 96;
// Use the "plain" code_challenge_method to keep the flow synchronous across
// runtime environments while still complying with PKCE requirements.
const PKCE_CODE_CHALLENGE_METHOD = "plain";

export default defineConnector({
  name: "GoogleCalendar",

  authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE,

  settingsSchema: {
    types: {
      Settings: {
        dataType: DataType.Struct,
        properties: {
          calendarId: {
            dataType: DataType.String,
          },
        },
      },
    },
    rootType: "Settings",
  },

  remoteDocumentSchema: EventSchema,

  getAuthorizationRequestUrl({
    collectionId,
    authenticationSettings,
    authenticationState,
  }) {
    const pkceParameters = makePkceParameters();
    const url = new URL(GOOGLE_OAUTH2_AUTHORIZATION_ENDPOINT);
    url.searchParams.set("client_id", authenticationSettings.clientId);
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("response_type", "code");
    url.searchParams.set(
      "scope",
      [
        "https://www.googleapis.com/auth/calendar.readonly",
        "openid",
        "email",
      ].join(" "),
    );
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("include_granted_scopes", "true");
    url.searchParams.set("code_challenge", pkceParameters.codeChallenge);
    url.searchParams.set(
      "code_challenge_method",
      pkceParameters.codeChallengeMethod,
    );
    // TODO: add a nonce to protect against CSRF attacks. They're exceedingly
    // unlikely, since each client uses their own OAuth application, and
    // attackers would need to know the collection id. Still, it's good practice
    // to do so.
    url.searchParams.set(
      "state",
      JSON.stringify({
        collectionId,
        codeVerifier: pkceParameters.codeVerifier,
      }),
    );
    if (authenticationState?.email) {
      url.searchParams.set("login_hint", authenticationState.email);
    }
    return url.toString();
  },

  async getAuthenticationState({
    authenticationSettings,
    authorizationResponseUrl,
  }) {
    try {
      const authorizationParameters = parseAuthorizationResponseParameters(
        authorizationResponseUrl,
      );
      const { codeVerifier } = parseAuthorizationState(
        authorizationParameters.get("state"),
      );
      const authorizationCode = authorizationParameters.get("code");
      if (!authorizationCode) {
        throw new Error(
          "Google Calendar OAuth2PKCE response does not include code",
        );
      }

      const exchangedTokens = await exchangeAuthorizationCodeForTokens({
        authorizationCode,
        authenticationSettings,
        codeVerifier,
      });

      const idToken = exchangedTokens.idToken;
      if (!idToken) {
        throw new Error(
          "Google Calendar OAuth2PKCE response does not include id_token",
        );
      }

      const userEmail = extractEmailFromIdToken(idToken);
      const refreshToken = exchangedTokens.refreshToken;
      if (!refreshToken) {
        throw new Error(
          "Google Calendar OAuth2PKCE token response does not include refresh_token",
        );
      }

      return makeSuccessfulResult({
        email: userEmail,
        accessToken: exchangedTokens.accessToken,
        refreshToken,
        accessTokenExpiresAt: exchangedTokens.accessTokenExpiresAt,
      });
    } catch (error) {
      return makeUnexpectedError(error);
    }
  },

  async syncDown({
    authenticationSettings,
    authenticationState,
    settings,
    syncFrom,
  }) {
    try {
      const calendarId = expectNonEmptyString(
        settings.calendarId,
        "settings.calendarId",
      );

      let currentAuthenticationState = await ensureValidAccessToken({
        authenticationSettings,
        authenticationState,
      });
      let currentSyncToken = syncFrom;

      // Retry loop to handle token refreshes and invalidated sync tokens.
      while (true) {
        try {
          const { changes, nextSyncToken } = await downloadCalendarChanges({
            calendarId,
            accessToken: currentAuthenticationState.accessToken,
            syncToken: currentSyncToken,
          });

          return makeSuccessfulResult({
            changes,
            authenticationState: currentAuthenticationState,
            syncPoint: nextSyncToken,
          });
        } catch (error) {
          if (error instanceof GoogleCalendarAccessTokenExpiredError) {
            currentAuthenticationState = await refreshAccessToken({
              authenticationSettings,
              authenticationState: currentAuthenticationState,
            });
            continue;
          }

          if (
            error instanceof GoogleCalendarSyncTokenExpiredError &&
            currentSyncToken !== null
          ) {
            currentSyncToken = null;
            continue;
          }

          throw error;
        }
      }
    } catch (error) {
      if (error instanceof GoogleCalendarAuthenticationFailedError) {
        return makeConnectorAuthenticationFailed(error.reason);
      }
      return makeUnexpectedError(error);
    }
  },
});

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

function makePkceParameters(): {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: string;
} {
  const codeVerifier = generatePkceCodeVerifier();
  return {
    codeVerifier,
    codeChallenge: codeVerifier,
    codeChallengeMethod: PKCE_CODE_CHALLENGE_METHOD,
  };
}

function generatePkceCodeVerifier(): string {
  const randomValues = new Uint8Array(PKCE_CODE_VERIFIER_LENGTH);
  crypto.getRandomValues(randomValues);
  const characterCount = PKCE_ALLOWED_CHARACTERS.length;

  let codeVerifier = "";
  for (const value of randomValues) {
    codeVerifier += PKCE_ALLOWED_CHARACTERS.charAt(value % characterCount);
  }
  return codeVerifier;
}

interface AuthorizationStatePayload {
  collectionId: string;
  codeVerifier: string;
}

function parseAuthorizationState(
  rawState: string | null,
): AuthorizationStatePayload {
  if (typeof rawState !== "string" || rawState.length === 0) {
    throw new Error(
      "Google Calendar OAuth2PKCE response does not include state",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawState);
  } catch {
    throw new Error("Google Calendar OAuth2PKCE state is not valid JSON");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Google Calendar OAuth2PKCE state is malformed");
  }

  const collectionId = expectNonEmptyString(
    (parsed as { collectionId?: unknown }).collectionId,
    "state.collectionId",
  );
  const codeVerifier = expectNonEmptyString(
    (parsed as { codeVerifier?: unknown }).codeVerifier,
    "state.codeVerifier",
  );

  return { collectionId, codeVerifier };
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
  idToken: string | null;
  accessTokenExpiresAt: Date;
}> {
  const body = new URLSearchParams({
    code: authorizationCode,
    client_id: authenticationSettings.clientId,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
    code_verifier: codeVerifier,
  });
  if (authenticationSettings.clientSecret) {
    body.set("client_secret", authenticationSettings.clientSecret);
  }

  const response = await fetch(GOOGLE_OAUTH2_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorDetail = await readErrorResponse(response);
    throw new Error(
      `Google OAuth2PKCE token exchange failed (${response.status}): ${errorDetail}`,
    );
  }

  const json = (await response.json()) as GoogleOAuth2PKCETokenResponseBody;
  const accessToken = expectNonEmptyString(json.access_token, "access_token");
  const expiresIn = expectNumber(json.expires_in, "expires_in");

  return {
    accessToken,
    refreshToken:
      typeof json.refresh_token === "string" ? json.refresh_token : null,
    idToken: typeof json.id_token === "string" ? json.id_token : null,
    accessTokenExpiresAt: computeAccessTokenExpiration(expiresIn),
  };
}

function extractEmailFromIdToken(idToken: string): string {
  const segments = idToken.split(".");
  if (segments.length < 2) {
    throw new Error("Google OAuth2PKCE id_token is malformed");
  }

  const payloadSegment = segments[1];
  if (typeof payloadSegment !== "string" || payloadSegment.length === 0) {
    throw new Error("Google OAuth2PKCE id_token payload segment is missing");
  }

  let payloadJson: string;
  try {
    payloadJson = Base64Url.decode(payloadSegment);
  } catch {
    throw new Error("Google OAuth2PKCE id_token payload cannot be decoded");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(payloadJson);
  } catch {
    throw new Error("Google OAuth2PKCE id_token payload is not valid JSON");
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof (payload as { email?: unknown }).email !== "string"
  ) {
    throw new Error(
      "Google OAuth2PKCE id_token payload does not include email",
    );
  }

  const email = (payload as { email: string }).email;
  if (email.length === 0) {
    throw new Error("Google OAuth2PKCE id_token email is empty");
  }

  return email;
}

async function ensureValidAccessToken({
  authenticationSettings,
  authenticationState,
}: {
  authenticationSettings: ConnectorAuthenticationSettings.OAuth2PKCE;
  authenticationState: ConnectorAuthenticationState.OAuth2PKCE;
}): Promise<ConnectorAuthenticationState.OAuth2PKCE> {
  const expirationDate = new Date(authenticationState.accessTokenExpiresAt);
  const millisecondsUntilExpiration =
    expirationDate.getTime() - Date.now() - ACCESS_TOKEN_EXPIRATION_BUFFER;

  if (millisecondsUntilExpiration > 0) {
    return {
      ...authenticationState,
      accessTokenExpiresAt: expirationDate,
    };
  }

  return refreshAccessToken({
    authenticationSettings: authenticationSettings,
    authenticationState: {
      ...authenticationState,
      accessTokenExpiresAt: expirationDate,
    },
  });
}

async function refreshAccessToken({
  authenticationSettings,
  authenticationState,
}: {
  authenticationSettings: ConnectorAuthenticationSettings.OAuth2PKCE;
  authenticationState: ConnectorAuthenticationState.OAuth2PKCE;
}): Promise<ConnectorAuthenticationState.OAuth2PKCE> {
  const refreshToken = expectNonEmptyString(
    authenticationState.refreshToken,
    "refresh_token",
  );

  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: authenticationSettings.clientId,
    grant_type: "refresh_token",
  });
  if (authenticationSettings.clientSecret) {
    body.set("client_secret", authenticationSettings.clientSecret);
  }

  const response = await fetch(GOOGLE_OAUTH2_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorDetail = await readErrorResponse(response);
    if (response.status === 400 || response.status === 401) {
      throw new GoogleCalendarAuthenticationFailedError(errorDetail);
    }
    throw new Error(
      `Google OAuth2PKCE refresh token request failed (${response.status}): ${errorDetail}`,
    );
  }

  const json = (await response.json()) as GoogleOAuth2PKCETokenResponseBody;
  const accessToken = expectNonEmptyString(json.access_token, "access_token");
  const expiresIn = expectNumber(json.expires_in, "expires_in");

  return {
    ...authenticationState,
    accessToken,
    accessTokenExpiresAt: computeAccessTokenExpiration(expiresIn),
    refreshToken:
      typeof json.refresh_token === "string"
        ? json.refresh_token
        : authenticationState.refreshToken,
  };
}

async function downloadCalendarChanges({
  calendarId,
  accessToken,
  syncToken,
}: {
  calendarId: string;
  accessToken: string;
  syncToken: string | null;
}): Promise<{ changes: CalendarChanges; nextSyncToken: string }> {
  const aggregatedChanges: CalendarChanges = {
    addedOrModified: [],
    deleted: [],
  };

  let pageToken: string | null = null;
  let nextSyncToken: string | null = null;

  do {
    const response = await fetchCalendarEventsPage({
      calendarId,
      accessToken,
      syncToken,
      pageToken,
    });

    applyEventsToChanges(response.items ?? [], aggregatedChanges);

    pageToken =
      typeof response.nextPageToken === "string"
        ? response.nextPageToken
        : null;

    if (typeof response.nextSyncToken === "string") {
      nextSyncToken = response.nextSyncToken;
    }
  } while (pageToken);

  const resolvedSyncToken = expectNonEmptyString(
    nextSyncToken,
    "nextSyncToken",
  );

  return {
    changes: aggregatedChanges,
    nextSyncToken: resolvedSyncToken,
  };
}

async function fetchCalendarEventsPage({
  calendarId,
  accessToken,
  syncToken,
  pageToken,
}: {
  calendarId: string;
  accessToken: string;
  syncToken: string | null;
  pageToken: string | null;
}): Promise<GoogleCalendarEventsResponse> {
  const url = new URL(
    `${GOOGLE_CALENDAR_EVENTS_ENDPOINT_BASE}/${encodeURIComponent(calendarId)}/events`,
  );
  url.searchParams.set("maxResults", String(GOOGLE_CALENDAR_PAGE_SIZE));
  url.searchParams.set("showDeleted", "true");

  if (pageToken) {
    url.searchParams.set("pageToken", pageToken);
  }

  if (syncToken) {
    url.searchParams.set("syncToken", syncToken);
  } else {
    url.searchParams.set("timeMin", GOOGLE_CALENDAR_FULL_SYNC_TIME_MIN);
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    throw new GoogleCalendarAccessTokenExpiredError();
  }

  if (response.status === 410) {
    throw new GoogleCalendarSyncTokenExpiredError();
  }

  if (!response.ok) {
    const errorDetail = await readErrorResponse(response);
    throw new Error(
      `Google Calendar API request failed (${response.status}): ${errorDetail}`,
    );
  }

  return (await response.json()) as GoogleCalendarEventsResponse;
}

function applyEventsToChanges(
  events: GoogleCalendarEvent[],
  changes: CalendarChanges,
): void {
  for (const event of events) {
    if (typeof event !== "object" || event === null) {
      continue;
    }

    const eventId = expectNonEmptyString(event.id, "event.id");
    if (event.status === "cancelled") {
      changes.deleted.push({ id: eventId });
      continue;
    }

    const versionId = deriveEventVersionId(event);
    changes.addedOrModified.push({
      id: eventId,
      versionId,
      content: makeRemoteDocument(event),
    });
  }
}

function deriveEventVersionId(event: GoogleCalendarEvent): string {
  const candidates = [event.etag, event.updated, event.created, event.id];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }

  throw new Error(
    "Google Calendar event is missing fields that can serve as versionId",
  );
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

function computeAccessTokenExpiration(expiresInSeconds: number): Date {
  return new Date(Date.now() + expiresInSeconds * 1000);
}

async function readErrorResponse(response: Response): Promise<string> {
  try {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text) as unknown;
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        typeof (parsed as { error?: unknown }).error === "object" &&
        (parsed as { error: { message?: unknown } }).error !== null &&
        typeof (parsed as { error: { message?: unknown } }).error.message ===
          "string"
      ) {
        return (parsed as { error: { message: string } }).error.message;
      }

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        typeof (parsed as { error_description?: unknown }).error_description ===
          "string"
      ) {
        return (parsed as { error_description: string }).error_description;
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
  if (error instanceof GoogleCalendarAuthenticationFailedError) {
    return {
      name: error.name,
      message: error.message,
      reason: error.reason,
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
