import {
  type Collection,
  type Connector,
  ConnectorAuthenticationStrategy,
} from "@superego/backend";
import { FormattedMessage } from "react-intl";
import useAuthenticateCollectionConnector from "../../../../business-logic/backend/useAuthenticateCollectionConnector.js";
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
  const authenticateConnector = useAuthenticateCollectionConnector();
  return CollectionUtils.hasRemote(collection) &&
    connector?.authenticationStrategy ===
      ConnectorAuthenticationStrategy.OAuth2PKCE ? (
    <Button onPress={() => authenticateConnector(collection)}>
      {!collection.remote.connectorAuthenticationState.isAuthenticated ? (
        <FormattedMessage defaultMessage="Authenticate connector" />
      ) : (
        <FormattedMessage defaultMessage="Re-authenticate connector" />
      )}
    </Button>
  ) : null;
}
