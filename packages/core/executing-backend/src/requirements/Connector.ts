import type {
  CollectionId,
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
    SettingsSchema extends Schema | null = null,
    RemoteDocument = any,
  > {
    name: string;
    authenticationStrategy: ConnectorAuthenticationStrategy.ApiKey;
    settingsSchema: SettingsSchema | null;
    remoteDocumentTypescriptSchema: {
      types: string;
      rootType: string;
    };
    syncDown(params: {
      authenticationSettings: ConnectorAuthenticationSettings.ApiKey;
      authenticationState: ConnectorAuthenticationState.ApiKey;
      settings: SettingsSchema extends Schema ? TypeOf<SettingsSchema> : null;
      /**
       * The point from which to sync. I.e., a previously returned syncPoint.
       */
      syncFrom: string | null;
    }): ResultPromise<
      {
        changes: Changes<RemoteDocument>;
        authenticationState: ConnectorAuthenticationState.ApiKey;
        syncPoint: string;
      },
      ConnectorAuthenticationFailed | UnexpectedError
    >;
  }

  export interface OAuth2PKCE<
    SettingsSchema extends Schema | null = null,
    RemoteDocument = any,
  > {
    name: string;
    authenticationStrategy: ConnectorAuthenticationStrategy.OAuth2PKCE;
    settingsSchema: SettingsSchema | null;
    remoteDocumentTypescriptSchema: {
      types: string;
      rootType: string;
    };
    getAuthorizationRequestUrl(params: {
      collectionId: CollectionId;
      authenticationSettings: ConnectorAuthenticationSettings.OAuth2PKCE;
    }): Promise<string>;
    getAuthenticationState(params: {
      authenticationSettings: ConnectorAuthenticationSettings.OAuth2PKCE;
      authorizationResponseUrl: string;
    }): ResultPromise<ConnectorAuthenticationState.OAuth2PKCE, UnexpectedError>;
    syncDown(params: {
      authenticationSettings: ConnectorAuthenticationSettings.OAuth2PKCE;
      authenticationState: ConnectorAuthenticationState.OAuth2PKCE;
      settings: SettingsSchema extends Schema ? TypeOf<SettingsSchema> : null;
      /**
       * The point from which to sync. I.e., a previously returned syncPoint.
       */
      syncFrom: string | null;
    }): ResultPromise<
      {
        changes: Changes<RemoteDocument>;
        authenticationState: ConnectorAuthenticationState.OAuth2PKCE;
        syncPoint: string;
      },
      ConnectorAuthenticationFailed | UnexpectedError
    >;
  }

  export interface AddedOrModifiedDocument<RemoteDocument = any> {
    id: string;
    versionId: string;
    url: string | null;
    content: RemoteDocument;
  }

  export interface DeletedDocument {
    id: string;
  }

  export interface Changes<RemoteDocument = any> {
    addedOrModified: AddedOrModifiedDocument<RemoteDocument>[];
    deleted: DeletedDocument[];
  }
}

type Connector<
  SettingsSchema extends Schema | null = null,
  RemoteDocument = any,
> =
  | Connector.ApiKey<SettingsSchema, RemoteDocument>
  | Connector.OAuth2PKCE<SettingsSchema, RemoteDocument>;

export default Connector;
