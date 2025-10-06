import type { CollectionId } from "@superego/backend";

export default class CollectionRemoteConnectorNotFound extends Error {
  override name = "CollectionRemoteConnectorNotFound";
  constructor(
    public collectionId: CollectionId,
    public connectorName: string,
  ) {
    super(
      `Collection ${collectionId} has remote connector ${connectorName}, but no such connector exists.`,
    );
  }
}
