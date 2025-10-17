import type { ResultError } from "@superego/global-types";
import type DownSyncStatus from "../enums/DownSyncStatus.js";
import type ConnectorAuthenticationFailed from "../errors/ConnectorAuthenticationFailed.js";
import type ConnectorNotAuthenticated from "../errors/ConnectorNotAuthenticated.js";
import type SyncingChangesFailed from "../errors/SyncingChangesFailed.js";
import type UnexpectedError from "../errors/UnexpectedError.js";
import type ConnectorAuthenticationSettings from "./ConnectorAuthenticationSettings.js";

export default interface Remote {
  connector: {
    name: string;
    authenticationSettings: ConnectorAuthenticationSettings;
    settings: any;
  };
  connectorAuthenticationState: {
    isAuthenticated: boolean;
  };
  syncState: {
    down: {
      status: DownSyncStatus;
      error: ResultError<any, any> | null;
      lastSucceededAt: Date | null;
    } & (
      | {
          status: DownSyncStatus.NeverSynced;
          error: null;
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
