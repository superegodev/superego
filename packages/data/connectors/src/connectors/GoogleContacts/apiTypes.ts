import type { Person } from "./remoteDocumentTypes.js";

export type ListConnectionsResponseBody =
  | { connections: Person[]; nextPageToken: string }
  | { connections: Person[]; nextSyncToken: string };
