import type { CollectionId, Connector } from "@superego/backend";
import CollectionRemoteConnectorNotFound from "../errors/CollectionRemoteConnectorNotFound.js";

export default function assertCollectionRemoteConnectorExists(
  collectionId: CollectionId,
  connectorName: string,
  connector: Connector | null,
): asserts connector is Connector {
  if (connector === null) {
    throw new CollectionRemoteConnectorNotFound(collectionId, connectorName);
  }
}
