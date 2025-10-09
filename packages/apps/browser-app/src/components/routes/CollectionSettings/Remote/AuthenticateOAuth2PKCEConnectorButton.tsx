import {
  type Collection,
  type Connector,
  ConnectorAuthenticationStrategy,
} from "@superego/backend";
import { Link } from "react-aria-components";
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
    !collection.remote.connectorAuthenticationState.isAuthenticated &&
    connector?.authenticationStrategy ===
      ConnectorAuthenticationStrategy.OAuth2PKCE ? (
    <DataLoader
      queries={[
        getOAuth2PKCEConnectorAuthorizationRequestUrlQuery([collection.id]),
      ]}
    >
      {(authorizationRequestUrl) => (
        <Link href={authorizationRequestUrl}>
          <Button>
            <FormattedMessage defaultMessage="Authenticate connector" />
          </Button>
        </Link>
      )}
    </DataLoader>
  ) : null;
}
