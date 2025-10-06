import type {
  ConnectorAuthenticationFailed,
  ConnectorAuthenticationState,
  ConnectorAuthenticationStrategy,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type { Schema } from "@superego/schema";

interface Connector {
  name: string;
  authenticationStrategy: ConnectorAuthenticationStrategy;
  settingsSchema: Schema;
  remoteDocumentSchema: Schema;
  syncDown(
    authenticationState: ConnectorAuthenticationState,
    settings: any,
    /** The point from which to sync. I.e., a previously returned syncPoint. */
    syncFrom: string | null,
  ): ResultPromise<
    {
      changes: Connector.Changes;
      syncPoint: string;
    },
    ConnectorAuthenticationFailed | UnexpectedError
  >;
}

namespace Connector {
  export interface AddedOrModifiedDocument {
    id: string;
    versionId: string;
    content: any;
  }

  export interface DeletedDocument {
    id: string;
  }

  export interface Changes {
    addedOrModified: AddedOrModifiedDocument[];
    deleted: DeletedDocument[];
  }
}

export default Connector;
