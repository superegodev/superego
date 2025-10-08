import type {
  ConnectorAuthenticationFailed,
  ConnectorAuthenticationSettings,
  ConnectorAuthenticationState,
  ConnectorAuthenticationStrategy,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type { Schema, TypeOf } from "@superego/schema";

namespace Connector {
  export interface ApiKey<
    SettingsSchema extends Schema = Schema,
    RemoteDocumentSchema extends Schema = Schema,
  > {
    name: string;
    settingsSchema: SettingsSchema;
    remoteDocumentSchema: RemoteDocumentSchema;
    authenticationStrategy: ConnectorAuthenticationStrategy.ApiKey;
    syncDown(params: {
      authenticationSettings: ConnectorAuthenticationSettings.ApiKey;
      authenticationState: ConnectorAuthenticationState.ApiKey;
      settings: TypeOf<SettingsSchema>;
      /**
       * The point from which to sync. I.e., a previously returned syncPoint.
       */
      syncFrom: string | null;
    }): ResultPromise<
      {
        changes: Changes<RemoteDocumentSchema>;
        authenticationState: ConnectorAuthenticationState.ApiKey;
        syncPoint: string;
      },
      ConnectorAuthenticationFailed | UnexpectedError
    >;
  }

  export interface OAuth2<
    SettingsSchema extends Schema = Schema,
    RemoteDocumentSchema extends Schema = Schema,
  > {
    name: string;
    authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2;
    settingsSchema: SettingsSchema;
    remoteDocumentSchema: RemoteDocumentSchema;
    getAuthorizationRequestUrl(params: {
      authenticationSettings: ConnectorAuthenticationSettings.OAuth2;
      authenticationState: ConnectorAuthenticationState.OAuth2 | null;
    }): string;
    getAuthenticationState(params: {
      authenticationSettings: ConnectorAuthenticationSettings.OAuth2;
      authorizationResponseUrl: string;
    }): ResultPromise<ConnectorAuthenticationState.OAuth2, UnexpectedError>;
    syncDown(params: {
      authenticationSettings: ConnectorAuthenticationSettings.OAuth2;
      authenticationState: ConnectorAuthenticationState.OAuth2;
      settings: TypeOf<SettingsSchema>;
      /**
       * The point from which to sync. I.e., a previously returned syncPoint.
       */
      syncFrom: string | null;
    }): ResultPromise<
      {
        changes: Changes<RemoteDocumentSchema>;
        authenticationState: ConnectorAuthenticationState.OAuth2;
        syncPoint: string;
      },
      ConnectorAuthenticationFailed | UnexpectedError
    >;
  }

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

type Connector<
  SettingsSchema extends Schema = Schema,
  RemoteDocumentSchema extends Schema = Schema,
> = Connector.ApiKey<SettingsSchema> | Connector.OAuth2<RemoteDocumentSchema>;

export default Connector;
