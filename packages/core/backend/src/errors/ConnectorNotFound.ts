import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

type ConnectorNotFound = ResultError<
  "ConnectorNotFound",
  {
    collectionId: CollectionId;
    connectorName: string;
  }
>;
export default ConnectorNotFound;
