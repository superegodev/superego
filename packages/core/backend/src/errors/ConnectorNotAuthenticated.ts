import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

type ConnectorNotAuthenticated = ResultError<
  "ConnectorNotAuthenticated",
  {
    collectionId: CollectionId;
    connectorName: string;
  }
>;
export default ConnectorNotAuthenticated;
