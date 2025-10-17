import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

type ConnectorDoesNotSupportUpSyncing = ResultError<
  "ConnectorDoesNotSupportUpSyncing",
  {
    collectionId: CollectionId;
    connectorName: string;
    message: string;
  }
>;
export default ConnectorDoesNotSupportUpSyncing;
