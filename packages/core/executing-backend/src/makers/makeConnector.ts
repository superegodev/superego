import type { Connector as ConnectorB } from "@superego/backend";
import type Connector from "../requirements/Connector.js";

export default function makeConnector(connector: Connector): ConnectorB {
  return {
    name: connector.name,
    remoteDocumentSchema: connector.remoteDocumentSchema,
  };
}
