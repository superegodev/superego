import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";

type ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy = ResultError<
  "ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy",
  {
    collectionId: CollectionId;
    connectorName: string;
  }
>;
export default ConnectorDoesNotUseOAuth2PKCEAuthenticationStrategy;
