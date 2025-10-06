import type { Schema } from "@superego/schema";
import type ConnectorAuthenticationStrategy from "../enums/ConnectorAuthenticationStrategy.js";

export default interface Connector {
  name: string;
  authenticationStrategy: ConnectorAuthenticationStrategy;
  settingsSchema: Schema;
  remoteDocumentSchema: Schema;
}
