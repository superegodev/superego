import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type RpcError from "../types/RpcError.js";
import type DocumentContentNotValid from "./DocumentContentNotValid.js";
import type DocumentNotFound from "./DocumentNotFound.js";
import type DocumentVersionIdNotMatching from "./DocumentVersionIdNotMatching.js";
import type FilesNotFound from "./FilesNotFound.js";
import type UnexpectedError from "./UnexpectedError.js";

type CollectionMigrationFailed = RpcError<
  "CollectionMigrationFailed",
  {
    collectionId: CollectionId;
    failedDocumentMigrations: {
      documentId: DocumentId;
      cause:
        | RpcError<
            "ApplyingMigrationFailed",
            {
              message: string;
              name?: string | undefined;
              stack?: string | undefined;
            }
          >
        | RpcError<
            "CreatingNewDocumentVersionFailed",
            {
              cause:
                | DocumentNotFound
                | DocumentVersionIdNotMatching
                | DocumentContentNotValid
                | FilesNotFound
                | UnexpectedError;
            }
          >
        | UnexpectedError;
    }[];
  }
>;
export default CollectionMigrationFailed;
