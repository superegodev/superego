import type { CollectionCategory } from "@superego/backend";

export default {
  getDisplayName(
    collectionCategory: Pick<CollectionCategory, "name" | "icon">,
  ): string {
    const { icon, name } = collectionCategory;
    return icon ? `${icon} ${name}` : name;
  },
};
