import * as v from "valibot";
import { DocumentVersionCreatorSchema } from "../enums/DocumentVersionCreator.js";
import ContentSummaryNotValidSchema from "../errors/ContentSummaryNotValid.js";
import ExecutingJavascriptFunctionFailedSchema from "../errors/ExecutingJavascriptFunctionFailed.js";
import CollectionVersionIdSchema from "../ids/CollectionVersionId.js";
import ConversationIdSchema from "../ids/ConversationId.js";
import DocumentVersionIdSchema from "../ids/DocumentVersionId.js";
import ContentSummarySchema from "./ContentSummary.js";

const contentSummaryResultSchema = v.union([
  v.object({
    success: v.literal(true),
    data: ContentSummarySchema,
    error: v.null(),
  }),
  v.object({
    success: v.literal(false),
    data: v.null(),
    error: v.union([
      ExecutingJavascriptFunctionFailedSchema,
      ContentSummaryNotValidSchema,
    ]),
  }),
]);

const DocumentVersionSchema = v.object({
  id: DocumentVersionIdSchema,
  /** Id of the remote counterpart of this document version. */
  remoteId: v.nullable(v.string()),
  collectionVersionId: CollectionVersionIdSchema,
  /** Id of the previous version. Null if this is the first version. */
  previousVersionId: v.nullable(DocumentVersionIdSchema),
  /**
   * Id of the conversation in which this document version was created. Not null
   * only when createdBy === DocumentVersionCreator.Assistant.
   */
  conversationId: v.nullable(ConversationIdSchema),
  content: v.any(),
  contentSummary: contentSummaryResultSchema,
  createdBy: DocumentVersionCreatorSchema,
  createdAt: v.date(),
});
export default DocumentVersionSchema;
export type DocumentVersion = v.InferOutput<typeof DocumentVersionSchema>;
