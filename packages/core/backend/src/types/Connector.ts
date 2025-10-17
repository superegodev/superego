import type { Schema } from "@superego/schema";
import type ConnectorAuthenticationStrategy from "../enums/ConnectorAuthenticationStrategy.js";

export default interface Connector {
  name: string;
  authenticationStrategy: ConnectorAuthenticationStrategy;
  settingsSchema: Schema | null;
  remoteDocumentTypescriptSchema: {
    /**
     * TypeScript module exporting the various types describing a remote
     * document. Types must not be default-exported.
     */
    types: string;
    /** Name of the "main" type describing the remote document. */
    rootType: string;
  };
}
