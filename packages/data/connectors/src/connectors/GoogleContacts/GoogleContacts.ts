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
import type { ListConnectionsResponseBody } from "./apiTypes.js";
import { GoogleContactsSyncTokenExpired } from "./errors.js";
import type { Person } from "./remoteDocumentTypes.js";
import remoteDocumentTypes from "./remoteDocumentTypes.js?raw";

export default class GoogleContacts
  extends OAuth2PKCEConnector
  implements Connector.OAuth2PKCE<null, Person>
{
  constructor(
    redirectUri: string,
    base64Url: Base64Url,
    sessionStorage: SessionStorage,
  ) {
    super("GoogleContacts", redirectUri, base64Url, sessionStorage, {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
      scopes: ["https://www.googleapis.com/auth/contacts"],
    });
  }

  settingsSchema = null;

  remoteDocumentTypescriptSchema = {
    types: remoteDocumentTypes,
    rootType: "Person",
  };

  syncDown: Connector.OAuth2PKCE<null, Person>["syncDown"] = async ({
    authenticationSettings,
    authenticationState,
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
            await GoogleContacts.fetchContactsChanges(
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
              freshAuthenticationState = await this.refreshAuthenticationState({
                authenticationSettings,
                authenticationState: freshAuthenticationState,
              });
            }
            if (error instanceof GoogleContactsSyncTokenExpired) {
              currentSyncToken = null;
            }
          },
          shouldRetry: ({ error }) =>
            error instanceof OAuth2PKCEAccessTokenNotValid ||
            error instanceof GoogleContactsSyncTokenExpired,
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

  private static async fetchContactsChanges(
    accessToken: string,
    syncToken: string | null,
  ): Promise<{ changes: Connector.Changes<Person>; nextSyncToken: string }> {
    const changes: Connector.Changes<Person> = {
      addedOrModified: [],
      deleted: [],
    };
    let pageToken: string | null = null;
    let nextSyncToken: string | null = null;

    do {
      const response = await GoogleContacts.fetchPersonsPage(
        accessToken,
        syncToken,
        pageToken,
      );

      for (const person of response.connections ?? []) {
        const id = person.resourceName;
        const versionId = person.etag;
        const url = GoogleContacts.personUrl(person);
        // Ignore persons that don't have an id, versionId, or url, as those
        // properties are required to process changes.
        if (!id || !versionId || !url) {
          continue;
        }
        if (person.metadata?.deleted) {
          changes.deleted.push({ id });
        } else {
          changes.addedOrModified.push({ id, versionId, url, content: person });
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

  private static personUrl(person: Person): string | null {
    const resourceId = person.resourceName
      ? person.resourceName.split("/").pop()
      : null;
    return resourceId
      ? `https://contacts.google.com/person/${encodeURIComponent(resourceId)}`
      : null;
  }

  private static async fetchPersonsPage(
    accessToken: string,
    syncToken: string | null,
    pageToken: string | null,
  ): Promise<ListConnectionsResponseBody> {
    const url = new URL(
      "https://people.googleapis.com/v1/people/me/connections",
    );
    url.searchParams.set("sources", "READ_SOURCE_TYPE_CONTACT");
    url.searchParams.set(
      "personFields",
      [
        "addresses",
        "ageRanges",
        "biographies",
        "birthdays",
        "calendarUrls",
        "clientData",
        "coverPhotos",
        "emailAddresses",
        "events",
        "externalIds",
        "genders",
        "imClients",
        "interests",
        "locales",
        "locations",
        "memberships",
        "metadata",
        "miscKeywords",
        "names",
        "nicknames",
        "occupations",
        "organizations",
        "phoneNumbers",
        "photos",
        "relations",
        "sipAddresses",
        "skills",
        "urls",
        "userDefined",
      ].join(","),
    );
    url.searchParams.set("pageSize", "1000");
    url.searchParams.set("requestSyncToken", "true");
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
          ? new GoogleContactsSyncTokenExpired()
          : await failedResponseToError("GET", undefined, response);
    }

    return (await response.json()) as ListConnectionsResponseBody;
  }
}
