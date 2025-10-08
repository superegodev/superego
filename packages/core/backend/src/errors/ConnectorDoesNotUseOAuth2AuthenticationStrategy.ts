import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

type ConnectorDoesNotUseOAuth2AuthenticationStrategy = ResultError<
  "ConnectorDoesNotUseOAuth2AuthenticationStrategy",
  {
    collectionId: CollectionId;
    connectorName: string;
  }
>;
export default ConnectorDoesNotUseOAuth2AuthenticationStrategy;
