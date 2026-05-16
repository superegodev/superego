import {
  type Remote,
  type RemoteConverters,
  DownSyncStatus,
} from "@superego/backend";
import * as v from "valibot";
import unknownResultError from "../../global/unknownResultError.js";
import { connectorAuthenticationSettings } from "./connector.js";
import { typescriptModule } from "./typescript.js";

export function remoteConverters(): v.GenericSchema<unknown, RemoteConverters> {
  return v.strictObject({
    fromRemoteDocument: typescriptModule(),
  });
}

const downSyncStateSchema = () =>
  v.union([
    v.strictObject({
      status: v.literal(DownSyncStatus.NeverSynced),
      error: v.null(),
      lastSucceededAt: v.null(),
    }),
    v.strictObject({
      status: v.literal(DownSyncStatus.Syncing),
      error: v.null(),
      lastSucceededAt: v.nullable(v.date()),
    }),
    v.strictObject({
      status: v.literal(DownSyncStatus.LastSyncSucceeded),
      error: v.null(),
      lastSucceededAt: v.nullable(v.date()),
    }),
    v.strictObject({
      status: v.literal(DownSyncStatus.LastSyncFailed),
      error: unknownResultError(),
      lastSucceededAt: v.nullable(v.date()),
    }),
  ]);

export function remote(): v.GenericSchema<unknown, Remote> {
  return v.strictObject({
    connector: v.strictObject({
      name: v.string(),
      authenticationSettings: connectorAuthenticationSettings(),
      settings: v.any(),
    }),
    connectorAuthenticationState: v.strictObject({
      isAuthenticated: v.boolean(),
    }),
    syncState: v.strictObject({
      down: downSyncStateSchema(),
    }),
  }) as v.GenericSchema<unknown, Remote>;
}
