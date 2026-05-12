import {
  type Remote,
  type RemoteConverters,
  DownSyncStatus,
} from "@superego/backend";
import * as v from "valibot";
import { connectorAuthenticationSettings } from "./connector.js";
import { typescriptModule } from "./typescript.js";

export function remoteConverters(): v.GenericSchema<unknown, RemoteConverters> {
  return v.looseObject({
    fromRemoteDocument: typescriptModule(),
  });
}

const resultErrorRecord = () =>
  v.looseObject({ name: v.string(), details: v.any() });

const downSyncStateSchema = () =>
  v.union([
    v.looseObject({
      status: v.literal(DownSyncStatus.NeverSynced),
      error: v.null(),
      lastSucceededAt: v.null(),
    }),
    v.looseObject({
      status: v.literal(DownSyncStatus.Syncing),
      error: v.null(),
      lastSucceededAt: v.nullable(v.date()),
    }),
    v.looseObject({
      status: v.literal(DownSyncStatus.LastSyncSucceeded),
      error: v.null(),
      lastSucceededAt: v.nullable(v.date()),
    }),
    v.looseObject({
      status: v.literal(DownSyncStatus.LastSyncFailed),
      error: resultErrorRecord(),
      lastSucceededAt: v.nullable(v.date()),
    }),
  ]);

export function remote(): v.GenericSchema<unknown, Remote> {
  return v.looseObject({
    connector: v.looseObject({
      name: v.string(),
      authenticationSettings: connectorAuthenticationSettings(),
      settings: v.any(),
    }),
    connectorAuthenticationState: v.looseObject({
      isAuthenticated: v.boolean(),
    }),
    syncState: v.looseObject({
      down: downSyncStateSchema(),
    }),
  }) as v.GenericSchema<unknown, Remote>;
}
