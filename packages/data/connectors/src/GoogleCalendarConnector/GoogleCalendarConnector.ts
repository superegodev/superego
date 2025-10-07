import {
  type ConnectorAuthenticationFailed,
  ConnectorAuthenticationStrategy,
  type UnexpectedError,
} from "@superego/backend";
import { DataType, type TypeOf } from "@superego/schema";
import defineConnector from "../utils/defineConnector.js";
import EventSchema from "./EventSchema.js";
import makeRemoteDocument from "./makeRemoteDocument.js";
import type {
  GoogleCalendarEvent,
  GoogleCalendarEventsResponse,
} from "./types.js";

interface FetchEventsParams {
  accessToken: string;
  calendarId: string;
  syncToken: string | null;
}

type FetchEventsResult =
  | {
      kind: "success";
      events: GoogleCalendarEvent[];
      nextSyncToken: string;
    }
  | {
      kind: "authError";
      reason: string;
    }
  | {
      kind: "syncTokenExpired";
    }
  | {
      kind: "unexpectedError";
      cause: unknown;
    };

const GOOGLE_CALENDAR_API_BASE =
  "https://www.googleapis.com/calendar/v3/calendars";
const ACCESS_TOKEN_REFRESH_THRESHOLD_MS = 60 * 1000;

export default defineConnector({
  name: "GoogleCalendar",
  authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2,
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
  async refreshAuthenticationState(
    authenticationSettings,
    authenticationState,
  ) {
    const accessTokenExpiresAt =
      authenticationState.accessTokenExpiresAt instanceof Date
        ? authenticationState.accessTokenExpiresAt
        : new Date(authenticationState.accessTokenExpiresAt);

    if (Number.isNaN(accessTokenExpiresAt.getTime())) {
      return {
        success: false,
        data: null,
        error: makeUnexpectedError(
          new Error("Google Calendar access token expiry is not a valid date."),
        ),
      };
    }

    const nowMs = Date.now();
    if (
      accessTokenExpiresAt.getTime() - ACCESS_TOKEN_REFRESH_THRESHOLD_MS >
      nowMs
    ) {
      return {
        success: true,
        data:
          accessTokenExpiresAt === authenticationState.accessTokenExpiresAt
            ? authenticationState
            : {
                ...authenticationState,
                accessTokenExpiresAt,
              },
        error: null,
      };
    }

    let discoveryResponse: Response;
    try {
      discoveryResponse = await fetch(authenticationSettings.discoveryEndpoint);
    } catch (error) {
      return {
        success: false,
        data: null,
        error: makeUnexpectedError(error),
      };
    }

    if (!discoveryResponse.ok) {
      return {
        success: false,
        data: null,
        error: makeUnexpectedError({
          status: discoveryResponse.status,
          statusText: discoveryResponse.statusText,
          body: await readErrorBody(discoveryResponse),
        }),
      };
    }

    let discoveryBody: unknown;
    try {
      discoveryBody = await discoveryResponse.json();
    } catch (error) {
      return {
        success: false,
        data: null,
        error: makeUnexpectedError(error),
      };
    }

    if (typeof discoveryBody !== "object" || discoveryBody === null) {
      return {
        success: false,
        data: null,
        error: makeUnexpectedError(
          new Error("Google Calendar discovery document was not an object."),
        ),
      };
    }

    const tokenEndpointRaw = (discoveryBody as Record<string, unknown>)[
      "token_endpoint"
    ];
    const tokenEndpoint =
      typeof tokenEndpointRaw === "string" && tokenEndpointRaw.length > 0
        ? tokenEndpointRaw
        : null;

    if (!tokenEndpoint) {
      return {
        success: false,
        data: null,
        error: makeUnexpectedError(
          new Error(
            "Google Calendar discovery document missing token_endpoint.",
          ),
        ),
      };
    }

    const body = new URLSearchParams({
      client_id: authenticationSettings.clientId,
      refresh_token: authenticationState.refreshToken,
      grant_type: "refresh_token",
    });

    let response: Response;
    try {
      response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
    } catch (error) {
      return {
        success: false,
        data: null,
        error: makeUnexpectedError(error),
      };
    }

    if (
      response.status === 400 ||
      response.status === 401 ||
      response.status === 403
    ) {
      return {
        success: false,
        data: null,
        error: makeConnectorAuthenticationFailed(
          await readErrorMessage(response),
        ),
      };
    }

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: makeUnexpectedError({
          status: response.status,
          statusText: response.statusText,
          body: await readErrorBody(response),
        }),
      };
    }

    let bodyJson: unknown;
    try {
      bodyJson = await response.json();
    } catch (error) {
      return {
        success: false,
        data: null,
        error: makeUnexpectedError(error),
      };
    }

    if (typeof bodyJson !== "object" || bodyJson === null) {
      return {
        success: false,
        data: null,
        error: makeUnexpectedError(
          new Error(
            "Google Calendar token refresh response was not an object.",
          ),
        ),
      };
    }

    const tokenResponse = bodyJson as Record<string, unknown>;
    const accessTokenRaw = tokenResponse["access_token"];
    const expiresInRaw = tokenResponse["expires_in"];
    const refreshTokenRaw = tokenResponse["refresh_token"];

    const accessToken =
      typeof accessTokenRaw === "string" && accessTokenRaw.length > 0
        ? accessTokenRaw
        : null;
    const expiresInSeconds =
      typeof expiresInRaw === "number"
        ? expiresInRaw
        : typeof expiresInRaw === "string"
          ? Number.parseInt(expiresInRaw, 10)
          : Number.NaN;

    if (
      !accessToken ||
      !Number.isFinite(expiresInSeconds) ||
      expiresInSeconds <= 0
    ) {
      return {
        success: false,
        data: null,
        error: makeUnexpectedError(
          new Error(
            "Google Calendar token refresh response missing required fields.",
          ),
        ),
      };
    }

    const refreshToken =
      typeof refreshTokenRaw === "string" && refreshTokenRaw.length > 0
        ? refreshTokenRaw
        : authenticationState.refreshToken;

    const refreshedAuthenticationState = {
      ...authenticationState,
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date(Date.now() + expiresInSeconds * 1000),
    };

    return {
      success: true,
      data: refreshedAuthenticationState,
      error: null,
    };
  },
  async syncDown(authenticationState, settings, syncFrom) {
    const { accessToken } = authenticationState;
    const { calendarId } = settings;

    const initialFetchResult = await fetchAllEvents({
      accessToken,
      calendarId,
      syncToken: syncFrom,
    });

    const finalFetchResult =
      initialFetchResult.kind === "syncTokenExpired"
        ? await fetchAllEvents({
            accessToken,
            calendarId,
            syncToken: null,
          })
        : initialFetchResult;

    if (finalFetchResult.kind === "authError") {
      return {
        success: false,
        data: null,
        error: makeConnectorAuthenticationFailed(finalFetchResult.reason),
      };
    }

    if (finalFetchResult.kind === "unexpectedError") {
      return {
        success: false,
        data: null,
        error: makeUnexpectedError(finalFetchResult.cause),
      };
    }

    if (finalFetchResult.kind !== "success") {
      return {
        success: false,
        data: null,
        error: makeUnexpectedError(
          new Error("Unknown error fetching Google Calendar events"),
        ),
      };
    }

    const addedOrModified: {
      id: string;
      versionId: string;
      content: TypeOf<typeof EventSchema>;
    }[] = [];
    const deleted: { id: string }[] = [];

    for (const event of finalFetchResult.events) {
      const id =
        typeof event.id === "string" && event.id.length > 0 ? event.id : null;
      if (!id) {
        continue;
      }

      const status =
        typeof event.status === "string" && event.status.length > 0
          ? event.status
          : "confirmed";
      if (status.toLowerCase() === "cancelled") {
        deleted.push({ id });
        continue;
      }

      const remoteDocument = makeRemoteDocument(event);
      const versionId =
        typeof event.etag === "string" && event.etag.length > 0
          ? event.etag
          : typeof event.updated === "string" && event.updated.length > 0
            ? event.updated
            : `${remoteDocument.updated}:${remoteDocument.sequence}`;

      addedOrModified.push({
        id,
        versionId,
        content: remoteDocument,
      });
    }

    return {
      success: true,
      data: {
        changes: { addedOrModified, deleted },
        syncPoint: finalFetchResult.nextSyncToken,
      },
      error: null,
    };
  },
});

async function fetchAllEvents(
  params: FetchEventsParams,
): Promise<FetchEventsResult> {
  const { accessToken, calendarId } = params;
  let syncToken = params.syncToken;
  let pageToken: string | undefined;
  const events: GoogleCalendarEvent[] = [];
  let nextSyncToken: string | undefined;

  do {
    let url: URL;
    try {
      url = new URL(
        `${encodeURIComponent(calendarId)}/events`,
        `${GOOGLE_CALENDAR_API_BASE}/`,
      );
    } catch (error) {
      return {
        kind: "unexpectedError",
        cause: error,
      };
    }

    url.searchParams.set("maxResults", "2500");
    url.searchParams.set("showDeleted", "true");
    url.searchParams.set("singleEvents", "true");

    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    if (syncToken) {
      url.searchParams.set("syncToken", syncToken);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      return {
        kind: "unexpectedError",
        cause: error,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        kind: "authError",
        reason: await readErrorMessage(response),
      };
    }

    if (response.status === 410) {
      return syncToken
        ? { kind: "syncTokenExpired" }
        : {
            kind: "unexpectedError",
            cause: new Error("Received 410 Gone without a sync token."),
          };
    }

    if (!response.ok) {
      return {
        kind: "unexpectedError",
        cause: {
          status: response.status,
          statusText: response.statusText,
          body: await readErrorBody(response),
        },
      };
    }

    let body: GoogleCalendarEventsResponse;
    try {
      body = (await response.json()) as GoogleCalendarEventsResponse;
    } catch (error) {
      return {
        kind: "unexpectedError",
        cause: error,
      };
    }

    if (body.items) {
      events.push(...body.items);
    }

    pageToken =
      typeof body.nextPageToken === "string" && body.nextPageToken.length > 0
        ? body.nextPageToken
        : undefined;

    if (
      typeof body.nextSyncToken === "string" &&
      body.nextSyncToken.length > 0
    ) {
      nextSyncToken = body.nextSyncToken;
      syncToken = body.nextSyncToken;
    }
  } while (pageToken);

  if (!nextSyncToken) {
    return {
      kind: "unexpectedError",
      cause: new Error("Google Calendar response missing nextSyncToken."),
    };
  }

  return {
    kind: "success",
    events,
    nextSyncToken,
  };
}

async function readErrorMessage(response: Response): Promise<string> {
  const body = await readErrorBody(response);
  if (typeof body === "object" && body !== null) {
    if (typeof (body as any).error_description === "string") {
      if (typeof (body as any).error === "string") {
        return `${(body as any).error}: ${(body as any).error_description}`;
      }
      return (body as any).error_description;
    }
    if (
      typeof (body as any).error === "object" &&
      (body as any).error !== null &&
      typeof (body as any).error.message === "string"
    ) {
      return (body as any).error.message;
    }
    if (typeof (body as any).error === "string") {
      return (body as any).error;
    }
  }
  if (typeof body === "string" && body.length > 0) {
    return body;
  }
  return `${response.status} ${response.statusText}`;
}

async function readErrorBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function makeConnectorAuthenticationFailed(
  reason: string,
): ConnectorAuthenticationFailed {
  return {
    name: "ConnectorAuthenticationFailed",
    details: { reason },
  };
}

function makeUnexpectedError(cause: unknown): UnexpectedError {
  return {
    name: "UnexpectedError",
    details: { cause },
  };
}
