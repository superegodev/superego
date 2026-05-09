import * as v from "valibot";
import DownSyncStatus from "../enums/DownSyncStatus.js";
import ConnectorAuthenticationFailedSchema from "../errors/ConnectorAuthenticationFailed.js";
import ConnectorNotAuthenticatedSchema from "../errors/ConnectorNotAuthenticated.js";
import SyncingChangesFailedSchema from "../errors/SyncingChangesFailed.js";
import UnexpectedErrorSchema from "../errors/UnexpectedError.js";
import ConnectorAuthenticationSettingsSchema from "./ConnectorAuthenticationSettings.js";

const downSyncStateSchema = v.variant("status", [
  v.object({
    status: v.literal(DownSyncStatus.NeverSynced),
    error: v.null(),
    lastSucceededAt: v.null(),
  }),
  v.object({
    status: v.literal(DownSyncStatus.Syncing),
    error: v.null(),
    lastSucceededAt: v.nullable(v.date()),
  }),
  v.object({
    status: v.literal(DownSyncStatus.LastSyncSucceeded),
    error: v.null(),
    lastSucceededAt: v.nullable(v.date()),
  }),
  v.object({
    status: v.literal(DownSyncStatus.LastSyncFailed),
    error: v.union([
      ConnectorNotAuthenticatedSchema,
      ConnectorAuthenticationFailedSchema,
      SyncingChangesFailedSchema,
      UnexpectedErrorSchema,
    ]),
    lastSucceededAt: v.nullable(v.date()),
  }),
]);

const RemoteSchema = v.object({
  connector: v.object({
    name: v.string(),
    authenticationSettings: ConnectorAuthenticationSettingsSchema,
    settings: v.any(),
  }),
  connectorAuthenticationState: v.object({
    isAuthenticated: v.boolean(),
  }),
  syncState: v.object({
    down: downSyncStateSchema,
  }),
});
export default RemoteSchema;
export type Remote = v.InferOutput<typeof RemoteSchema>;
