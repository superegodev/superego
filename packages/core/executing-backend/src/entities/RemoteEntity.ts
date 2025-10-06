import type {
  ConnectorAuthenticationFailed,
  ConnectorAuthenticationSettings,
  ConnectorAuthenticationState,
  ConnectorNotAuthenticated,
  DownSyncStatus,
  SyncingChangesFailed,
  UnexpectedError,
} from "@superego/backend";
import type { ResultError } from "@superego/global-types";

export default interface RemoteEntity {
  connector: {
    name: string;
    authenticationSettings: ConnectorAuthenticationSettings;
    settings: any;
  };
  connectorState: {
    authentication: ConnectorAuthenticationState | null;
  };
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
          error:
            | ConnectorNotAuthenticated
            | ConnectorAuthenticationFailed
            | SyncingChangesFailed
            | UnexpectedError;
        }
    );
  };
}
