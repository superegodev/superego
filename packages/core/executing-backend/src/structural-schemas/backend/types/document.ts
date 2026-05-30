import {
  type Document,
  type DocumentDefinition,
  type DocumentVersion,
  type DocumentContentChange,
  DocumentContentChangeType,
  type JsonPatchOperation,
  DocumentVersionCreator,
  type LiteDocument,
  type LiteDocumentVersion,
  type MinimalDocumentVersion,
} from "@superego/backend";
import * as v from "valibot";
import {
  collectionId,
  collectionVersionId,
  conversationId,
  documentId,
  documentVersionId,
  protoCollectionId,
} from "../ids.js";
import { contentSummary } from "./contentSummary.js";
import validationIssue from "./issue.js";

const contentSummaryResult = () =>
  v.union([
    v.strictObject({
      success: v.literal(true),
      data: contentSummary(),
      error: v.null(),
    }),
    v.strictObject({
      success: v.literal(false),
      data: v.null(),
      error: v.union([
        v.strictObject({
          name: v.union([
            v.literal("ExecutingTypescriptFunctionFailed"),
            // Accept legacy persisted summaries for backwards compatibility.
            v.literal("ExecutingJavascriptFunctionFailed"),
          ]),
          details: v.strictObject({
            message: v.string(),
            name: v.optional(v.string()),
            stack: v.optional(v.string()),
          }),
        }),
        v.strictObject({
          name: v.literal("ContentSummaryNotValid"),
          details: v.strictObject({
            collectionId: collectionId(),
            collectionVersionId: collectionVersionId(),
            documentId: documentId(),
            documentVersionId: documentVersionId(),
            issues: v.array(validationIssue()),
          }),
        }),
      ]),
    }),
  ]);

const documentVersionBase = () => ({
  id: documentVersionId(),
  collectionVersionId: collectionVersionId(),
  previousVersionId: v.nullable(documentVersionId()),
  conversationId: v.nullable(conversationId()),
  createdBy: v.picklist(Object.values(DocumentVersionCreator)),
  createdAt: v.date(),
});

export function documentVersion(): v.GenericSchema<unknown, DocumentVersion> {
  return v.strictObject({
    ...documentVersionBase(),
    content: v.any(),
    contentSummary: contentSummaryResult(),
  }) as v.GenericSchema<unknown, DocumentVersion>;
}

export function liteDocumentVersion(): v.GenericSchema<
  unknown,
  LiteDocumentVersion
> {
  return v.strictObject({
    ...documentVersionBase(),
    contentSummary: contentSummaryResult(),
  }) as v.GenericSchema<unknown, LiteDocumentVersion>;
}

export function minimalDocumentVersion(): v.GenericSchema<
  unknown,
  MinimalDocumentVersion
> {
  return v.strictObject(documentVersionBase()) as v.GenericSchema<
    unknown,
    MinimalDocumentVersion
  >;
}

export function document(): v.GenericSchema<unknown, Document> {
  return v.strictObject({
    id: documentId(),
    collectionId: collectionId(),
    latestVersion: documentVersion(),
    createdAt: v.date(),
  });
}

export function liteDocument(): v.GenericSchema<unknown, LiteDocument> {
  return v.strictObject({
    id: documentId(),
    collectionId: collectionId(),
    latestVersion: liteDocumentVersion(),
    createdAt: v.date(),
  }) as v.GenericSchema<unknown, LiteDocument>;
}

export function documentDefinition(): v.GenericSchema<
  unknown,
  DocumentDefinition<false>
> {
  return v.strictObject({
    collectionId: collectionId(),
    content: v.any(),
    options: v.optional(v.strictObject({ skipDuplicateCheck: v.boolean() })),
  });
}

export function documentContentChange(): v.GenericSchema<
  unknown,
  DocumentContentChange
> {
  return v.union([
    v.strictObject({
      type: v.literal(DocumentContentChangeType.Full),
      content: v.any(),
    }),
    v.strictObject({
      type: v.literal(DocumentContentChangeType.Patch),
      patch: v.array(jsonPatchOperation()),
    }),
  ]);
}

function jsonPatchOperation(): v.GenericSchema<unknown, JsonPatchOperation> {
  return v.union([
    v.strictObject({
      op: v.literal("add"),
      path: v.string(),
      value: v.any(),
    }),
    v.strictObject({
      op: v.literal("remove"),
      path: v.string(),
    }),
    v.strictObject({
      op: v.literal("replace"),
      path: v.string(),
      value: v.any(),
    }),
    v.strictObject({
      op: v.literal("move"),
      path: v.string(),
      from: v.string(),
    }),
    v.strictObject({
      op: v.literal("copy"),
      path: v.string(),
      from: v.string(),
    }),
    v.strictObject({
      op: v.literal("test"),
      path: v.string(),
      value: v.any(),
    }),
  ]) as v.GenericSchema<unknown, JsonPatchOperation>;
}

export function protoDocumentDefinition(): v.GenericSchema<
  unknown,
  DocumentDefinition<true>
> {
  return v.strictObject({
    collectionId: v.union([protoCollectionId(), collectionId()]),
    content: v.any(),
    options: v.optional(v.strictObject({ skipDuplicateCheck: v.boolean() })),
  });
}
