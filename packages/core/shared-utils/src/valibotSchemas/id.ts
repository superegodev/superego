import type {
  AppId,
  CollectionCategoryId,
  CollectionId,
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

export default { collectionCategory, collection, app };
