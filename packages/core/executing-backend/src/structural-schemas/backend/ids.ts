import type {
  AppId,
  AppVersionId,
  BackgroundJobId,
  CollectionCategoryId,
  CollectionId,
  CollectionVersionId,
  ConversationId,
  DocumentId,
  DocumentVersionId,
  FileId,
  MessageId,
  PackId,
  ProtoAppId,
  ProtoCollectionCategoryId,
  ProtoCollectionId,
  ProtoDocumentId,
} from "@superego/backend";
import { Id } from "@superego/shared-utils";
import * as v from "valibot";

export function appId(): v.GenericSchema<unknown, AppId> {
  return v.custom<AppId>(Id.is.app);
}
export function appVersionId(): v.GenericSchema<unknown, AppVersionId> {
  return v.custom<AppVersionId>(Id.is.appVersion);
}
export function backgroundJobId(): v.GenericSchema<unknown, BackgroundJobId> {
  return v.custom<BackgroundJobId>(Id.is.backgroundJob);
}
export function collectionCategoryId(): v.GenericSchema<
  unknown,
  CollectionCategoryId
> {
  return v.custom<CollectionCategoryId>(Id.is.collectionCategory);
}
export function collectionId(): v.GenericSchema<unknown, CollectionId> {
  return v.custom<CollectionId>(Id.is.collection);
}
export function collectionVersionId(): v.GenericSchema<
  unknown,
  CollectionVersionId
> {
  return v.custom<CollectionVersionId>(Id.is.collectionVersion);
}
export function conversationId(): v.GenericSchema<unknown, ConversationId> {
  return v.custom<ConversationId>(Id.is.conversation);
}
export function documentId(): v.GenericSchema<unknown, DocumentId> {
  return v.custom<DocumentId>(Id.is.document);
}
export function documentVersionId(): v.GenericSchema<
  unknown,
  DocumentVersionId
> {
  return v.custom<DocumentVersionId>(Id.is.documentVersion);
}
export function fileId(): v.GenericSchema<unknown, FileId> {
  return v.custom<FileId>(Id.is.file);
}
export function messageId(): v.GenericSchema<unknown, MessageId> {
  return v.custom<MessageId>(Id.is.message);
}
export function packId(): v.GenericSchema<unknown, PackId> {
  // No type guard exists for packs in @superego/shared-utils.
  return v.pipe(v.string(), v.regex(/^Pack_.+$/)) as unknown as v.GenericSchema<
    unknown,
    PackId
  >;
}
export function protoAppId(): v.GenericSchema<unknown, ProtoAppId> {
  return v.custom<ProtoAppId>(Id.is.protoApp);
}
export function protoCollectionCategoryId(): v.GenericSchema<
  unknown,
  ProtoCollectionCategoryId
> {
  return v.custom<ProtoCollectionCategoryId>(Id.is.protoCollectionCategory);
}
export function protoCollectionId(): v.GenericSchema<
  unknown,
  ProtoCollectionId
> {
  return v.custom<ProtoCollectionId>(Id.is.protoCollection);
}
export function protoDocumentId(): v.GenericSchema<unknown, ProtoDocumentId> {
  return v.custom<ProtoDocumentId>(Id.is.protoDocument);
}
