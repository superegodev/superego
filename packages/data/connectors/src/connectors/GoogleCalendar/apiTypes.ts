import type { Event } from "./remoteDocumentTypes.js";

export type ListEventsResponseBody =
  | { items: Event[]; nextPageToken: string }
  | { items: Event[]; nextSyncToken: string };
