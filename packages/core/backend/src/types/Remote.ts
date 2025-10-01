import type { ResultError } from "@superego/global-types";
import type DownSyncStatus from "../enums/DownSyncStatus.js";
import type ConnectorNotFound from "../errors/ConnectorNotFound.js";
import type SyncingChangesFailed from "../errors/SyncingChangesFailed.js";
import type UnexpectedError from "../errors/UnexpectedError.js";

export default interface Remote {
  connectorName: string;
  connectorSettings: any;
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
          error: ConnectorNotFound | SyncingChangesFailed | UnexpectedError;
        }
    );
  };
}
