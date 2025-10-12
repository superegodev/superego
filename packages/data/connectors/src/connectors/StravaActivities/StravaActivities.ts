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
import type {
  GetActivityResponseBody,
  ListAthleteActivitiesResponseBody,
} from "./apiTypes.js";
import { StravaRateLimitExceeded } from "./errors.js";
import type {
  DetailedActivity,
  SummaryActivity,
} from "./remoteDocumentTypes.js";
import remoteDocumentTypes from "./remoteDocumentTypes.js?raw";

export default class StravaActivities
  extends OAuth2PKCEConnector
  implements Connector.OAuth2PKCE<null, DetailedActivity>
{
  constructor(
    redirectUri: string,
    base64Url: Base64Url,
    sessionStorage: SessionStorage,
  ) {
    super("StravaActivities", redirectUri, base64Url, sessionStorage, {
      authorizationEndpoint: "https://www.strava.com/oauth/authorize",
      tokenEndpoint: "https://www.strava.com/api/v3/oauth/token",
      scopes: ["activity:read_all"],
    });
  }

  settingsSchema = null;

  remoteDocumentTypescriptSchema = {
    types: remoteDocumentTypes,
    rootType: "DetailedActivity",
  };

  syncDown: Connector.OAuth2PKCE<null, DetailedActivity>["syncDown"] = async ({
    authenticationSettings,
    authenticationState,
    syncFrom,
  }) => {
    try {
      let freshAuthenticationState = await this.getFreshAuthenticationState({
        authenticationSettings,
        authenticationState,
      });

      return pRetry(
        async () => {
          const { changes, nextSyncToken } =
            await StravaActivities.fetchActivitiesChanges(
              freshAuthenticationState.accessToken,
              syncFrom,
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
          },
          shouldRetry: ({ error }) =>
            error instanceof OAuth2PKCEAccessTokenNotValid,
        },
      );
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

  private static async fetchActivitiesChanges(
    accessToken: string,
    syncToken: string | null,
  ): Promise<{
    changes: Connector.Changes<DetailedActivity>;
    nextSyncToken: string;
  }> {
    const changes: Connector.Changes<DetailedActivity> = {
      addedOrModified: [],
      deleted: [],
    };
    const after = Number.parseInt(syncToken ?? "0", 10);

    let page = 0;
    let hasMore = true;

    do {
      const response = await StravaActivities.fetchActivitiesPage(
        accessToken,
        after,
        page,
      );
      page += 1;
      hasMore = response.hasMore;

      for (const summaryActivity of response.summaryActivities) {
        // Ignore activities that don't have an id, as we can't do much with
        // them.
        if (!summaryActivity.id) {
          continue;
        }

        let detailedActivity: DetailedActivity;
        let etag: string | null;
        try {
          ({ detailedActivity, etag } =
            await StravaActivities.fetchDetailedActivity(
              accessToken,
              summaryActivity.id,
            ));
        } catch (error) {
          if (error instanceof StravaRateLimitExceeded) {
            hasMore = false;
            break;
          }
          throw error;
        }

        const id = String(summaryActivity.id);
        const versionId = etag;

        // Ignore activities that don't have a versionId, as we can't do much
        // with them.
        if (!versionId) {
          continue;
        }

        changes.addedOrModified.push({
          id,
          versionId,
          content: detailedActivity,
        });
      }
    } while (hasMore);

    const maxStartDate = Math.max(
      ...changes.addedOrModified.map(
        ({ content }) => content.startDate?.getTime() ?? 0,
      ),
    );
    const nextSyncToken = String(Math.floor(maxStartDate / 1000));

    return { changes, nextSyncToken };
  }

  private static async fetchActivitiesPage(
    accessToken: string,
    after: number | null,
    page: number | null,
  ): Promise<{
    summaryActivities: SummaryActivity[];
    hasMore: boolean;
  }> {
    const url = new URL("https://www.strava.com/api/v3/athlete/activities");
    url.searchParams.set("after", String(after ?? 0));
    url.searchParams.set("page", String(page ?? 0));
    url.searchParams.set("per_page", "200");

    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw response.status === 401
        ? new OAuth2PKCEAccessTokenNotValid()
        : response.status === 429
          ? new StravaRateLimitExceeded()
          : await failedResponseToError("GET", undefined, response);
    }

    const summaryActivities =
      (await response.json()) as ListAthleteActivitiesResponseBody;

    // Per the Strava documentation (https://developers.strava.com/docs/):
    //
    // > Note that in certain cases, the number of items returned in the
    // > response may be lower than the requested page size, even when that page
    // > is not the last. If you need to fully go through the full set of
    // > results, prefer iterating until an empty page is returned.
    const hasMore = summaryActivities.length !== 0;

    return { summaryActivities, hasMore };
  }

  private static async fetchDetailedActivity(
    accessToken: string,
    id: number,
  ): Promise<{ detailedActivity: DetailedActivity; etag: string | null }> {
    const url = new URL(`https://www.strava.com/api/v3/activities/${id}`);

    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw response.status === 401
        ? new OAuth2PKCEAccessTokenNotValid()
        : response.status === 429
          ? new StravaRateLimitExceeded()
          : await failedResponseToError("GET", undefined, response);
    }

    const detailedActivity = (await response.json()) as GetActivityResponseBody;
    const etag = response.headers.get("etag");

    return { detailedActivity, etag };
  }
}
