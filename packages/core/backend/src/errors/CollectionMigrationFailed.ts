import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import DocumentIdSchema from "../ids/DocumentId.js";
import UnexpectedErrorSchema from "./UnexpectedError.js";

const applyingMigrationFailedSchema = defineError(
  "ApplyingMigrationFailed",
  v.object({
    message: v.string(),
    name: v.optional(v.string()),
    stack: v.optional(v.string()),
  }),
);

const creatingNewDocumentVersionFailedSchema = defineError(
  "CreatingNewDocumentVersionFailed",
  v.object({
    cause: v.object({ name: v.string(), details: v.any() }),
  }),
);

const CollectionMigrationFailedSchema = defineError(
  "CollectionMigrationFailed",
  v.object({
    collectionId: CollectionIdSchema,
    failedDocumentMigrations: v.array(
      v.object({
        documentId: DocumentIdSchema,
        cause: v.union([
          applyingMigrationFailedSchema,
          creatingNewDocumentVersionFailedSchema,
          UnexpectedErrorSchema,
        ]),
      }),
    ),
  }),
);
export default CollectionMigrationFailedSchema;
export type CollectionMigrationFailed = v.InferOutput<
  typeof CollectionMigrationFailedSchema
>;
