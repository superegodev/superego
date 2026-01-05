import type { Person } from "./remoteDocumentTypes.js";

export type ListConnectionsResponseBody =
  | { connections?: Person[] | undefined; nextPageToken: string }
  | { connections?: Person[] | undefined; nextSyncToken: string };
