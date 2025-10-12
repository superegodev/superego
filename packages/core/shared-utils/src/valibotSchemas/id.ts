import type { CollectionCategoryId, CollectionId } from "@superego/backend";
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

export default { collectionCategory, collection };
