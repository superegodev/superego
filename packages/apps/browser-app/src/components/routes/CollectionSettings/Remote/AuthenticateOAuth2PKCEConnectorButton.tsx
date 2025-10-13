import {
  type Collection,
  type Connector,
  ConnectorAuthenticationStrategy,
} from "@superego/backend";
import { FormattedMessage } from "react-intl";
import DataLoader from "../../../../business-logic/backend/DataLoader.js";
import { getOAuth2PKCEConnectorAuthorizationRequestUrlQuery } from "../../../../business-logic/backend/hooks.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import Button from "../../../design-system/Button/Button.js";

interface Props {
  collection: Collection;
  connector: Connector | null;
}
export default function AuthenticateOAuth2PKCEConnectorButton({
  collection,
  connector,
}: Props) {
  return CollectionUtils.hasRemote(collection) &&
    connector?.authenticationStrategy ===
      ConnectorAuthenticationStrategy.OAuth2PKCE ? (
    <DataLoader
      queries={[
        getOAuth2PKCEConnectorAuthorizationRequestUrlQuery([collection.id]),
      ]}
    >
      {(authorizationRequestUrl) => (
        <Button
          onPress={() => {
            if (
              "openInNativeBrowser" in window &&
              typeof window.openInNativeBrowser === "function"
            ) {
              window.openInNativeBrowser(authorizationRequestUrl);
            } else {
              window.open(authorizationRequestUrl, "_blank");
            }
          }}
        >
          {!collection.remote.connectorAuthenticationState.isAuthenticated ? (
            <FormattedMessage defaultMessage="Authenticate connector" />
          ) : (
            <FormattedMessage defaultMessage="Re-authenticate connector" />
          )}
        </Button>
      )}
    </DataLoader>
  ) : null;
}
