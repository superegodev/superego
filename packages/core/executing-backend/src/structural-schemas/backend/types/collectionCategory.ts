import type {
  CollectionCategory,
  CollectionCategoryDefinition,
} from "@superego/backend";
import * as v from "valibot";
import { collectionCategoryId, protoCollectionCategoryId } from "../ids.js";

export function collectionCategory(): v.GenericSchema<
  unknown,
  CollectionCategory
> {
  return v.looseObject({
    id: collectionCategoryId(),
    name: v.string(),
    icon: v.nullable(v.string()),
    parentId: v.nullable(collectionCategoryId()),
    createdAt: v.date(),
  });
}

export function collectionCategoryDefinition(): v.GenericSchema<
  unknown,
  CollectionCategoryDefinition<false>
> {
  return v.looseObject({
    name: v.string(),
    icon: v.nullable(v.string()),
    parentId: v.nullable(collectionCategoryId()),
  });
}

export function protoCollectionCategoryDefinition(): v.GenericSchema<
  unknown,
  CollectionCategoryDefinition<true>
> {
  return v.looseObject({
    name: v.string(),
    icon: v.nullable(v.string()),
    parentId: v.nullable(
      v.union([protoCollectionCategoryId(), collectionCategoryId()]),
    ),
  });
}
