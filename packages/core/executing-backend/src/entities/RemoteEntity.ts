import type {
  ConnectorAuthenticationFailed,
  ConnectorAuthenticationSettings,
  ConnectorAuthenticationState,
  ConnectorNotAuthenticated,
  DownSyncStatus,
  SyncingChangesFailed,
  UnexpectedError,
} from "@superego/backend";

export default interface RemoteEntity {
  connector: {
    name: string;
    authenticationSettings: ConnectorAuthenticationSettings;
    settings: any;
  };
  connectorAuthenticationState: ConnectorAuthenticationState | null;
  syncState: {
    down:
      | {
          status: DownSyncStatus.NeverSynced;
          error: null;
          syncedUntil: null;
          lastSucceededAt: null;
        }
      | {
          status: DownSyncStatus.Syncing;
          error: null;
          syncedUntil: string | null;
          lastSucceededAt: Date | null;
        }
      | {
          status: DownSyncStatus.LastSyncSucceeded;
          error: null;
          /**
           * An opaque, connector-defined token representing the point until which
           * the collection was synced.
           */
          syncedUntil: string;
          lastSucceededAt: Date;
        }
      | {
          status: DownSyncStatus.LastSyncFailed;
          error:
            | ConnectorNotAuthenticated
            | ConnectorAuthenticationFailed
            | SyncingChangesFailed
            | UnexpectedError;
          syncedUntil: string | null;
          lastSucceededAt: Date | null;
        };
  };
}
