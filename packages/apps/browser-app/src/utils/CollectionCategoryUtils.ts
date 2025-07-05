import type { CollectionCategory } from "@superego/backend";

export default {
  getDisplayName(collectionCategory: CollectionCategory): string {
    const { icon, name } = collectionCategory;
    return icon ? `${icon} ${name}` : name;
  },
};
