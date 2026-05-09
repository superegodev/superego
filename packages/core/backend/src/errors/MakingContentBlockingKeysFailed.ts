import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import CollectionVersionIdSchema from "../ids/CollectionVersionId.js";
import DocumentIdSchema from "../ids/DocumentId.js";
import ExecutingJavascriptFunctionFailedSchema from "./ExecutingJavascriptFunctionFailed.js";

const contentBlockingKeysNotValidSchema = defineError(
  "ContentBlockingKeysNotValid",
  v.object({ contentBlockingKeys: v.any() }),
);

const MakingContentBlockingKeysFailedSchema = defineError(
  "MakingContentBlockingKeysFailed",
  v.object({
    collectionId: CollectionIdSchema,
    collectionVersionId: CollectionVersionIdSchema,
    documentId: v.nullable(DocumentIdSchema),
    cause: v.union([
      contentBlockingKeysNotValidSchema,
      ExecutingJavascriptFunctionFailedSchema,
    ]),
  }),
);
export default MakingContentBlockingKeysFailedSchema;
export type MakingContentBlockingKeysFailed = v.InferOutput<
  typeof MakingContentBlockingKeysFailedSchema
>;
