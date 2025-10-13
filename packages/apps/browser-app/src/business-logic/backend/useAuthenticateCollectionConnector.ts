import {
  type Collection,
  ConnectorAuthenticationStrategy,
} from "@superego/backend";
import { useGlobalData } from "./GlobalData.js";
import useBackend from "./useBackend.js";

export type UseAuthenticateCollectionConnector = (
  collection: Collection,
) => Promise<void>;
export default function useAuthenticateCollectionConnector(): UseAuthenticateCollectionConnector {
  const backend = useBackend();
  const { connectors } = useGlobalData();
  return async (collection) => {
    const connectorName = collection.remote?.connector.name;
    if (connectorName === undefined) {
      throw new Error(`Collection ${collection.id} doesn't have a remote`);
    }

    const connector = connectors.find(
      (connector) => connector.name === connectorName,
    );
    if (!connector) {
      throw new Error(
        `Collection ${collection.id} remote connector ${connectorName} not found`,
      );
    }

    switch (connector.authenticationStrategy) {
      case ConnectorAuthenticationStrategy.OAuth2PKCE: {
        const result =
          await backend.collections.getOAuth2PKCEConnectorAuthorizationRequestUrl(
            collection.id,
          );
        if (!result.success) {
          throw result.error;
        }
        if (
          "openInNativeBrowser" in window &&
          typeof window.openInNativeBrowser === "function"
        ) {
          window.openInNativeBrowser(result.data);
        } else {
          window.open(result.data, "_blank");
        }
        return;
      }
      default: {
        throw new Error(
          `authenticateCollectionRemoteConnector does not support authentication strategy ${connector.authenticationStrategy}`,
        );
      }
    }
  };
}
