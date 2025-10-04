import type { UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type { Schema } from "@superego/schema";

interface Connector {
  name: string;
  // authenticationStrategy: AuthenticationStrategy;
  settingsSchema: Schema;
  remoteDocumentSchema: Schema;
  syncDown(
    // TODO: auth, settings
    // auth: Connector.Auth & { strategy: AuthenticationStrategy },
    // settings: any, // TODO: typing or use valibot schema
    /** The point from which to sync. I.e., a previously returned syncPoint. */
    syncFrom: string | null,
  ): ResultPromise<
    {
      changes: Connector.Changes;
      syncPoint: string;
    },
    // TODO: more errors like invalid auth etc
    UnexpectedError
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
