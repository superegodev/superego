import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

type ConnectorAuthenticationFailed = ResultError<
  "ConnectorAuthenticationFailed",
  {
    collectionId: CollectionId;
    reason: string;
  }
>;
export default ConnectorAuthenticationFailed;
