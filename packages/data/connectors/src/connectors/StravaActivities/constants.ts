import type { Milliseconds } from "@superego/global-types";

export const STRAVA_OAUTH_AUTHORIZATION_ENDPOINT =
  "https://www.strava.com/oauth/authorize";
export const STRAVA_OAUTH_TOKEN_ENDPOINT =
  "https://www.strava.com/api/v3/oauth/token";
export const STRAVA_ACTIVITIES_ENDPOINT =
  "https://www.strava.com/api/v3/athlete/activities";
export const STRAVA_ACTIVITY_DETAIL_ENDPOINT =
  "https://www.strava.com/api/v3/activities";
export const STRAVA_ACTIVITIES_PAGE_SIZE = 200;
export const ACCESS_TOKEN_EXPIRATION_BUFFER: Milliseconds = 60_000;
export const REDIRECT_URI =
  "dev.superego://dev.superego/oauth2-callback/StravaActivities";
