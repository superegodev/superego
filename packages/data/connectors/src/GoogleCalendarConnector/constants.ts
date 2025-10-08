import type { Milliseconds } from "@superego/global-types";

export const GOOGLE_OAUTH2_AUTHORIZATION_ENDPOINT =
  "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_OAUTH2_TOKEN_ENDPOINT =
  "https://oauth2.googleapis.com/token";
export const GOOGLE_CALENDAR_EVENTS_ENDPOINT_BASE =
  "https://www.googleapis.com/calendar/v3/calendars";
export const GOOGLE_CALENDAR_PAGE_SIZE = 2500;
export const GOOGLE_CALENDAR_FULL_SYNC_TIME_MIN = "1970-01-01T00:00:00.000Z";
export const ACCESS_TOKEN_EXPIRATION_BUFFER: Milliseconds = 60_000;
// TODO: define in better way.
export const REDIRECT_URI =
  "http://localhost:5173/oauth2-callback/GoogleCalendar";
