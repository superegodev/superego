import type {
  AppId,
  CollectionCategoryId,
  CollectionId,
  PackId,
  ProtoAppId,
  ProtoCollectionId,
  ProtoDocumentId,
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

function pack(): v.GenericSchema<PackId, PackId> {
  return v.custom(Id.is.pack);
}

function protoCollection(): v.GenericSchema<
  ProtoCollectionId,
  ProtoCollectionId
> {
  return v.custom(Id.is.protoCollection);
}

function protoDocument(): v.GenericSchema<ProtoDocumentId, ProtoDocumentId> {
  return v.custom(Id.is.protoDocument);
}

function protoApp(): v.GenericSchema<ProtoAppId, ProtoAppId> {
  return v.custom(Id.is.protoApp);
}

export default {
  collectionCategory,
  collection,
  app,
  pack,
  protoCollection,
  protoDocument,
  protoApp,
};
