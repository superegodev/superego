import type { Milliseconds } from "@superego/global-types";

export const GOOGLE_OAUTH2_AUTHORIZATION_ENDPOINT =
  "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_OAUTH2_TOKEN_ENDPOINT =
  "https://oauth2.googleapis.com/token";
export const GOOGLE_CONTACTS_CONNECTIONS_ENDPOINT =
  "https://people.googleapis.com/v1/people/me/connections";
export const GOOGLE_CONTACTS_PAGE_SIZE = 1000;
export const GOOGLE_CONTACTS_PERSON_FIELDS = [
  "addresses",
  "biographies",
  "birthdays",
  "emailAddresses",
  "events",
  "imClients",
  "interests",
  "locations",
  "memberships",
  "metadata",
  "names",
  "nicknames",
  "occupations",
  "organizations",
  "phoneNumbers",
  "photos",
  "relations",
  "sipAddresses",
  "urls",
  "userDefined",
].join(",");
export const GOOGLE_CONTACTS_SOURCES = "READ_SOURCE_TYPE_CONTACT";
export const ACCESS_TOKEN_EXPIRATION_BUFFER: Milliseconds = 60_000;
export const REDIRECT_URI =
  "http://localhost:5173/oauth2-callback/GoogleContacts";
