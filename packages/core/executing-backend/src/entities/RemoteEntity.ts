import type {
  ConnectorNotFound,
  DownSyncStatus,
  SyncingChangesFailed,
  UnexpectedError,
} from "@superego/backend";
import type { ResultError } from "@superego/global-types";

export default interface RemoteEntity {
  connectorName: string;
  connectorSettings: any;
  syncState: {
    down: {
      status: DownSyncStatus;
      error: ResultError<any, any> | null;
      /**
       * An opaque, connector-defined token representing the point until which
       * the collection was synced.
       */
      syncedUntil: string | null;
      lastSucceededAt: Date | null;
    } & (
      | {
          status: DownSyncStatus.NeverSynced;
          error: null;
          syncedUntil: null;
          lastSucceededAt: null;
        }
      | { status: DownSyncStatus.Syncing; error: null }
      | { status: DownSyncStatus.LastSyncSucceeded; error: null }
      | {
          status: DownSyncStatus.LastSyncFailed;
          error: ConnectorNotFound | SyncingChangesFailed | UnexpectedError;
        }
    );
  };
}
