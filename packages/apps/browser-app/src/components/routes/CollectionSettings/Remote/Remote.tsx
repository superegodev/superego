import type { Collection, Connector } from "@superego/backend";
import { useEffect, useState } from "react";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import AuthenticateOAuth2PKCEConnectorButton from "./AuthenticateOAuth2PKCEConnectorButton.js";
import ConnectorSelect from "./ConnectorSelect.js";
import SetCollectionRemoteForm from "./SetCollectionRemoteForm.js";
import UnsetCollectionRemoteButton from "./UnsetCollectionRemoteButton.js";

interface Props {
  collection: Collection;
  connectors: Connector[];
}
export default function Remote({ collection, connectors }: Props) {
  const connectorName = collection.remote?.connector.name;
  const [connector, setConnector] = useState<Connector | null>(() =>
    connectorName
      ? (connectors.find(({ name }) => name === connectorName) ?? null)
      : null,
  );
  // Reset the selected connector when the remote is unset (hence connectorName
  // changes to undefined).
  useEffect(() => {
    if (!connectorName) {
      setConnector(null);
    }
  }, [connectorName]);
  return (
    <>
      <ConnectorSelect
        connectors={connectors}
        value={connector}
        onChange={setConnector}
        isDisabled={CollectionUtils.hasRemote(collection)}
      />
      <UnsetCollectionRemoteButton collection={collection} />
      {connector ? (
        <SetCollectionRemoteForm
          key={`SetCollectionRemoteForm_${collection.id}_${connector.name}`}
          collection={collection}
          connector={connector}
          authenticateConnectorButton={
            <AuthenticateOAuth2PKCEConnectorButton
              collection={collection}
              connector={connector}
            />
          }
        />
      ) : null}
    </>
  );
}
