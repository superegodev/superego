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
  PackId,
} from "@superego/backend";
import * as v from "valibot";
import Id from "../Id/Id.js";

function collectionCategory(): v.GenericSchema<
  CollectionCategoryId,
  CollectionCategoryId
> {
  return v.custom(Id.is.collectionCategory);
}

function collection(): v.GenericSchema<CollectionId, CollectionId> {
  return v.custom(Id.is.collection);
}

function collectionVersion(): v.GenericSchema<
  CollectionVersionId,
  CollectionVersionId
> {
  return v.custom(Id.is.collectionVersion);
}

function app(): v.GenericSchema<AppId, AppId> {
  return v.custom(Id.is.app);
}

function appVersion(): v.GenericSchema<AppVersionId, AppVersionId> {
  return v.custom(Id.is.appVersion);
}

function document(): v.GenericSchema<DocumentId, DocumentId> {
  return v.custom(Id.is.document);
}

function documentVersion(): v.GenericSchema<
  DocumentVersionId,
  DocumentVersionId
> {
  return v.custom(Id.is.documentVersion);
}

function file(): v.GenericSchema<FileId, FileId> {
  return v.custom(Id.is.file);
}

function conversation(): v.GenericSchema<ConversationId, ConversationId> {
  return v.custom(Id.is.conversation);
}

function backgroundJob(): v.GenericSchema<BackgroundJobId, BackgroundJobId> {
  return v.custom(Id.is.backgroundJob);
}

function pack(): v.GenericSchema<PackId, PackId> {
  return v.custom(
    (value): value is PackId =>
      typeof value === "string" && /^Pack_\S+$/.test(value),
  );
}

export default {
  collectionCategory,
  collection,
  collectionVersion,
  app,
  appVersion,
  document,
  documentVersion,
  file,
  conversation,
  backgroundJob,
  pack,
};
