import type { Remote } from "@superego/backend";
import type RemoteEntity from "../entities/RemoteEntity.js";

export default function makeRemote(remote: RemoteEntity): Remote {
  const { syncedUntil, ...down } = remote.syncState.down;
  return {
    connector: remote.connector,
    connectorState: {
      isAuthenticated: remote.connectorState.authentication !== null,
    },
    syncState: { down },
  };
}
