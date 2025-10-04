import type { Schema } from "@superego/schema";

export default interface Connector {
  name: string;
  // TODO
  // authenticationStrategy: AuthenticationStrategy;
  // settingsSchema: Schema;
  remoteDocumentSchema: Schema;
}
