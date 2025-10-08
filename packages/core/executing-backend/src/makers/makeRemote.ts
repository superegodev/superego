import {
  ConnectorAuthenticationStrategy,
  type Remote,
} from "@superego/backend";
import type RemoteEntity from "../entities/RemoteEntity.js";
import type Connector from "../requirements/Connector.js";

export default function makeRemote(
  remote: RemoteEntity,
  connector: Connector,
): Remote {
  const { syncedUntil, ...down } = remote.syncState.down;
  return {
    connector: remote.connector,
    connectorAuthenticationState: {
      isAuthenticated:
        connector.authenticationStrategy ===
        ConnectorAuthenticationStrategy.OAuth2
          ? remote.connectorAuthenticationState !== null
          : true,
    },
    syncState: { down },
  };
}
