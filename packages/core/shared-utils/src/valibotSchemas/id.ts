import type {
  AppId,
  CollectionCategoryId,
  CollectionId,
  DocumentId,
  DocumentVersionId,
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

function app(): v.GenericSchema<AppId, AppId> {
  return v.custom(Id.is.app);
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

export default {
  collectionCategory,
  collection,
  app,
  document,
  documentVersion,
};
