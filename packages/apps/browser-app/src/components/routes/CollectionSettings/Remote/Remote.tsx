import type { Collection, Connector } from "@superego/backend";
import { useState } from "react";
import ConnectorSelect from "./ConnectorSelect.jsx";
import SetCollectionRemoteForm from "./SetCollectionRemoteForm.jsx";

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
  return (
    <>
      <ConnectorSelect
        connectors={connectors}
        value={connector}
        onChange={setConnector}
        isDisabled={connectorName !== undefined}
      />
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
