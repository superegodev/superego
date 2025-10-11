import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

type CannotChangeCollectionRemoteConnector = ResultError<
  "CannotChangeCollectionRemoteConnector",
  {
    collectionId: CollectionId;
    currentConnectorName: string;
    suppliedConnectorName: string;
  }
>;
export default CannotChangeCollectionRemoteConnector;
