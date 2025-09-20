import type { CollectionCategoryEntity } from "@superego/executing-backend";
import { Id } from "@superego/shared-utils";

export const Finance: CollectionCategoryEntity = {
  id: Id.generate.collectionCategory(),
  name: "Finance",
  icon: "💰️",
  parentId: null,
  createdAt: new Date(),
};
