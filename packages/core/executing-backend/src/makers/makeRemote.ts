import type { Remote } from "@superego/backend";
import type RemoteEntity from "../entities/RemoteEntity.js";

export default function makeRemote(remote: RemoteEntity): Remote {
  const { syncedUntil, ...down } = remote.syncState.down;
  return {
    connectorName: remote.connectorName,
    connectorSettings: remote.connectorSettings,
    syncState: { down },
  };
}
