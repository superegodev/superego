import {
  type Collection,
  type Connector,
  ConnectorAuthenticationStrategy,
} from "@superego/backend";
import { useState } from "react";
import { Link } from "react-aria-components";
import DataLoader from "../../../../business-logic/backend/DataLoader.js";
import { getOAuth2PKCEConnectorAuthorizationRequestUrlQuery } from "../../../../business-logic/backend/hooks.js";
import ConnectorSelect from "./ConnectorSelect.jsx";
import SetCollectionRemoteForm from "./SetCollectionRemoteForm.jsx";

interface Props {
  collection: Collection;
  connectors: Connector[];
}
export default function Remote({ collection, connectors }: Props) {
  const collectionHasRemote = collection.remote !== null;
  const connectorName = collection.remote?.connector.name;
  const [connector, setConnector] = useState<Connector | null>(() =>
    connectorName
      ? (connectors.find(({ name }) => name === connectorName) ?? null)
      : null,
  );
  return (
    <>
      <ConnectorSelect
        connectors={connectors}
        value={connector}
        onChange={setConnector}
        isDisabled={collectionHasRemote}
      />
      {collectionHasRemote &&
      connector?.authenticationStrategy ===
        ConnectorAuthenticationStrategy.OAuth2PKCE ? (
        <DataLoader
          queries={[
            getOAuth2PKCEConnectorAuthorizationRequestUrlQuery([collection.id]),
          ]}
        >
          {(authorizationRequestUrl) => (
            <Link href={authorizationRequestUrl}>{"Authenticate"}</Link>
          )}
        </DataLoader>
      ) : null}
      {connector ? (
        <SetCollectionRemoteForm
          key={`SetCollectionRemoteForm_${collection.id}_${connector.name}`}
          collection={collection}
          connector={connector}
        />
      ) : null}
    </>
  );
}
