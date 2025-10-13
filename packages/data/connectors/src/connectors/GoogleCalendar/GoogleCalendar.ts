import type { Connector } from "@superego/executing-backend";
import {
  failedResponseToError,
  makeSuccessfulResult,
} from "@superego/shared-utils";
import pRetry from "p-retry";
import {
  OAuth2PKCEAccessTokenNotValid,
  OAuth2PKCERefreshAuthenticationStateFailed,
} from "../../common/OAuth2PKCEConnector/errors.js";
import OAuth2PKCEConnector from "../../common/OAuth2PKCEConnector/OAuth2PKCEConnector.js";
import type Base64Url from "../../requirements/Base64Url.js";
import type SessionStorage from "../../requirements/SessionStorage.js";
import type { ListEventsResponseBody } from "./apiTypes.js";
import { GoogleCalendarSyncTokenExpired } from "./errors.js";
import type { Event } from "./remoteDocumentTypes.js";
import remoteDocumentTypes from "./remoteDocumentTypes.js?raw";
import SettingsSchema from "./SettingsSchema.js";

export default class GoogleCalendar
  extends OAuth2PKCEConnector
  implements Connector.OAuth2PKCE<typeof SettingsSchema, Event>
{
  constructor(
    redirectUri: string,
    base64Url: Base64Url,
    sessionStorage: SessionStorage,
  ) {
    super("GoogleCalendar", redirectUri, base64Url, sessionStorage, {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
  }

  settingsSchema = SettingsSchema;

  remoteDocumentTypescriptSchema = {
    types: remoteDocumentTypes,
    rootType: "Event",
  };

  syncDown: Connector.OAuth2PKCE<typeof SettingsSchema, Event>["syncDown"] =
    async ({
      authenticationSettings,
      authenticationState,
      settings: { calendarId },
      syncFrom,
    }) => {
      try {
        let freshAuthenticationState = await this.getFreshAuthenticationState({
          authenticationSettings,
          authenticationState,
        });
        let currentSyncToken = syncFrom;

        const result = await pRetry(
          async () => {
            const { changes, nextSyncToken } =
              await GoogleCalendar.fetchCalendarChanges(
                calendarId,
                freshAuthenticationState.accessToken,
                currentSyncToken,
              );
            return makeSuccessfulResult({
              changes: changes,
              authenticationState: freshAuthenticationState,
              syncPoint: nextSyncToken,
            });
          },
          {
            retries: 1,
            onFailedAttempt: async ({ error, retriesLeft }) => {
              if (retriesLeft === 0) {
                return;
              }
              if (error instanceof OAuth2PKCEAccessTokenNotValid) {
                freshAuthenticationState =
                  await this.refreshAuthenticationState({
                    authenticationSettings,
                    authenticationState: freshAuthenticationState,
                  });
              }
              if (error instanceof GoogleCalendarSyncTokenExpired) {
                currentSyncToken = null;
              }
            },
            shouldRetry: ({ error }) =>
              error instanceof OAuth2PKCEAccessTokenNotValid ||
              error instanceof GoogleCalendarSyncTokenExpired,
          },
        );
        return result;
      } catch (error) {
        return {
          success: false,
          data: null,
          error: {
            name:
              error instanceof OAuth2PKCEAccessTokenNotValid ||
              error instanceof OAuth2PKCERefreshAuthenticationStateFailed
                ? "ConnectorAuthenticationFailed"
                : "UnexpectedError",
            details: { cause: error },
          },
        };
      }
    };

  private static async fetchCalendarChanges(
    calendarId: string,
    accessToken: string,
    syncToken: string | null,
  ): Promise<{ changes: Connector.Changes<Event>; nextSyncToken: string }> {
    const changes: Connector.Changes<Event> = {
      addedOrModified: [],
      deleted: [],
    };
    let pageToken: string | null = null;
    let nextSyncToken: string | null = null;

    do {
      const response = await GoogleCalendar.fetchEventsPage(
        calendarId,
        accessToken,
        syncToken,
        pageToken,
      );

      for (const event of response.items) {
        const id = event.id;
        const versionId = event.etag;
        // Ignore events that don't have an id or a versionId, as we can't do much
        // with them.
        if (!id || !versionId) {
          continue;
        }
        if (event.status === "cancelled") {
          changes.deleted.push({ id });
        } else {
          changes.addedOrModified.push({ id, versionId, content: event });
        }
      }

      pageToken =
        "nextPageToken" in response &&
        typeof response.nextPageToken === "string"
          ? response.nextPageToken
          : null;
      if (
        "nextSyncToken" in response &&
        typeof response.nextSyncToken === "string"
      ) {
        nextSyncToken = response.nextSyncToken;
      }
    } while (pageToken !== null);

    // TypeScript can't understand, but when we're out of the loop nextSyncToken
    // is not null.
    return { changes, nextSyncToken: nextSyncToken! };
  }

  private static async fetchEventsPage(
    calendarId: string,
    accessToken: string,
    syncToken: string | null,
    pageToken: string | null,
  ): Promise<ListEventsResponseBody> {
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    );
    url.searchParams.set("maxResults", "2500");
    url.searchParams.set("showDeleted", "true");
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }
    if (syncToken) {
      url.searchParams.set("syncToken", syncToken);
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw response.status === 401
        ? new OAuth2PKCEAccessTokenNotValid()
        : response.status === 410
          ? new GoogleCalendarSyncTokenExpired()
          : await failedResponseToError("GET", undefined, response);
    }

    return (await response.json()) as ListEventsResponseBody;
  }
}
