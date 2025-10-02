import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type UnexpectedError from "./UnexpectedError.js";

type CollectionMigrationFailed = ResultError<
  "CollectionMigrationFailed",
  {
    collectionId: CollectionId;
    failedDocumentMigrations: {
      documentId: DocumentId;
      cause:
        | ResultError<
            "ApplyingMigrationFailed",
            {
              message: string;
              name?: string | undefined;
              stack?: string | undefined;
            }
          >
        | ResultError<
            "CreatingNewDocumentVersionFailed",
            { cause: ResultError<string, any> }
          >
        | UnexpectedError;
    }[];
  }
>;
export default CollectionMigrationFailed;
