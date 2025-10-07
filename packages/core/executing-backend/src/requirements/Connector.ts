import type {
  ConnectorAuthenticationFailed,
  ConnectorAuthenticationSettings,
  ConnectorAuthenticationState,
  ConnectorAuthenticationStrategy,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type { Schema, TypeOf } from "@superego/schema";

interface Connector<
  SettingsSchema extends Schema = Schema,
  RemoteDocumentSchema extends Schema = Schema,
> {
  name: string;
  authenticationStrategy: ConnectorAuthenticationStrategy;
  settingsSchema: SettingsSchema;
  remoteDocumentSchema: RemoteDocumentSchema;
  refreshAuthenticationState(
    authenticationSettings: ConnectorAuthenticationSettings,
    authenticationState: ConnectorAuthenticationState,
  ): ResultPromise<
    ConnectorAuthenticationState,
    ConnectorAuthenticationFailed | UnexpectedError
  >;
  syncDown(
    authenticationState: ConnectorAuthenticationState,
    settings: TypeOf<SettingsSchema>,
    /** The point from which to sync. I.e., a previously returned syncPoint. */
    syncFrom: string | null,
  ): ResultPromise<
    { changes: Connector.Changes<RemoteDocumentSchema>; syncPoint: string },
    ConnectorAuthenticationFailed | UnexpectedError
  >;
}

namespace Connector {
  export interface AddedOrModifiedDocument<
    RemoteDocumentSchema extends Schema = Schema,
  > {
    id: string;
    versionId: string;
    content: TypeOf<RemoteDocumentSchema>;
  }

  export interface DeletedDocument {
    id: string;
  }

  export interface Changes<RemoteDocumentSchema extends Schema = Schema> {
    addedOrModified: AddedOrModifiedDocument<RemoteDocumentSchema>[];
    deleted: DeletedDocument[];
  }
}

export default Connector;
