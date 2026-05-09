import * as v from "valibot";

enum DownSyncStatus {
  NeverSynced = "NeverSynced",
  Syncing = "Syncing",
  LastSyncSucceeded = "LastSyncSucceeded",
  LastSyncFailed = "LastSyncFailed",
}
export default DownSyncStatus;

export const DownSyncStatusSchema = v.enum(DownSyncStatus);
