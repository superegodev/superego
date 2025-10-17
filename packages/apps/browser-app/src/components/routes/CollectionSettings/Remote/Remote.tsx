import type { Collection, Connector } from "@superego/backend";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import formattedMessageHtmlTags from "../../../../utils/formattedMessageHtmlTags.js";
import Alert from "../../../design-system/Alert/Alert.js";
import AuthenticateOAuth2PKCEConnectorButton from "./AuthenticateOAuth2PKCEConnectorButton.js";
import ConnectorSelect from "./ConnectorSelect.js";
import SetCollectionRemoteForm from "./SetCollectionRemoteForm.js";

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
      <Alert variant="info">
        <FormattedMessage
          defaultMessage={`
            <p>
              You can sync a collection with an external data source (a
              <b>remote</b>). When a remote is configured, it becomes the
              <i>source of truth</i> for that collection.
            </p>
            <p>
              The collection isn't necessarily an exact replica of the remote.
              Documents pulled from the remote are transformed to match your
              collection's schema via your <code>fromRemoteDocument</code>
              mapping, and you can filter which remote documents are synced.
            </p>
            <p>
              To set up a remote, configure a <i>connector</i> to the external
              data source.
            </p>
            <p>
              Some connectors support only <b>syncing down from</b> the remote,
              making the collection read-only. Others also support <b>syncing
              up to</b> the remote, so creates, updates, and deletes in the
              collection are propagated to the remote.
            </p>
            <p>
              More info at <a>https://superego.dev/connectors</a>.
            </p>
          `}
          values={formattedMessageHtmlTags}
        />
      </Alert>
      <ConnectorSelect
        connectors={connectors}
        value={connector}
        onChange={setConnector}
        isDisabled={CollectionUtils.hasRemote(collection)}
      />
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
