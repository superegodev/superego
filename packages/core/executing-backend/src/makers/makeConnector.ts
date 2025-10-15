import type { Connector as ConnectorB } from "@superego/backend";
import type Connector from "../requirements/Connector.js";

export default function makeConnector(connector: Connector): ConnectorB {
  return {
    name: connector.name,
    authenticationStrategy: connector.authenticationStrategy,
    settingsSchema: connector.settingsSchema,
    remoteDocumentTypescriptSchema: connector.remoteDocumentTypescriptSchema,
    protoRemoteDocumentTypescriptSchema:
      connector.protoRemoteDocumentTypescriptSchema ?? null,
  };
}
