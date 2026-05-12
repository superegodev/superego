import {
  type Document,
  type DocumentDefinition,
  type DocumentVersion,
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
} from "../helpers/idSchemas.js";
import validationIssueSchema from "../helpers/validationIssueSchema.js";
import { contentSummary } from "./contentSummary.js";

const contentSummaryResult = () =>
  v.union([
    v.looseObject({
      success: v.literal(true),
      data: contentSummary(),
      error: v.null(),
    }),
    v.looseObject({
      success: v.literal(false),
      data: v.null(),
      error: v.union([
        v.looseObject({
          name: v.literal("ExecutingJavascriptFunctionFailed"),
          details: v.looseObject({
            message: v.string(),
            name: v.optional(v.string()),
            stack: v.optional(v.string()),
          }),
        }),
        v.looseObject({
          name: v.literal("ContentSummaryNotValid"),
          details: v.looseObject({
            collectionId: collectionId(),
            collectionVersionId: collectionVersionId(),
            documentId: documentId(),
            documentVersionId: documentVersionId(),
            issues: v.array(validationIssueSchema()),
          }),
        }),
      ]),
    }),
  ]);

const documentVersionBase = () => ({
  id: documentVersionId(),
  remoteId: v.nullable(v.string()),
  collectionVersionId: collectionVersionId(),
  previousVersionId: v.nullable(documentVersionId()),
  conversationId: v.nullable(conversationId()),
  createdBy: v.picklist(Object.values(DocumentVersionCreator)),
  createdAt: v.date(),
});

export function documentVersion(): v.GenericSchema<unknown, DocumentVersion> {
  return v.looseObject({
    ...documentVersionBase(),
    content: v.any(),
    contentSummary: contentSummaryResult(),
  }) as v.GenericSchema<unknown, DocumentVersion>;
}

export function liteDocumentVersion(): v.GenericSchema<
  unknown,
  LiteDocumentVersion
> {
  return v.looseObject({
    ...documentVersionBase(),
    contentSummary: contentSummaryResult(),
  }) as v.GenericSchema<unknown, LiteDocumentVersion>;
}

export function minimalDocumentVersion(): v.GenericSchema<
  unknown,
  MinimalDocumentVersion
> {
  return v.looseObject(documentVersionBase()) as v.GenericSchema<
    unknown,
    MinimalDocumentVersion
  >;
}

const documentRemoteDiscriminator = () =>
  v.union([
    v.looseObject({ remoteId: v.null(), remoteUrl: v.null() }),
    v.looseObject({ remoteId: v.string(), remoteUrl: v.nullable(v.string()) }),
  ]);

export function document(): v.GenericSchema<unknown, Document> {
  return v.intersect([
    v.looseObject({
      id: documentId(),
      collectionId: collectionId(),
      latestVersion: documentVersion(),
      createdAt: v.date(),
    }),
    documentRemoteDiscriminator(),
  ]) as v.GenericSchema<unknown, Document>;
}

export function liteDocument(): v.GenericSchema<unknown, LiteDocument> {
  return v.intersect([
    v.looseObject({
      id: documentId(),
      collectionId: collectionId(),
      latestVersion: liteDocumentVersion(),
      createdAt: v.date(),
    }),
    documentRemoteDiscriminator(),
  ]) as v.GenericSchema<unknown, LiteDocument>;
}

export function documentDefinition(): v.GenericSchema<
  unknown,
  DocumentDefinition<false>
> {
  return v.looseObject({
    collectionId: collectionId(),
    content: v.any(),
    options: v.optional(v.looseObject({ skipDuplicateCheck: v.boolean() })),
  });
}

export function protoDocumentDefinition(): v.GenericSchema<
  unknown,
  DocumentDefinition<true>
> {
  return v.looseObject({
    collectionId: v.union([protoCollectionId(), collectionId()]),
    content: v.any(),
    options: v.optional(v.looseObject({ skipDuplicateCheck: v.boolean() })),
  });
}
