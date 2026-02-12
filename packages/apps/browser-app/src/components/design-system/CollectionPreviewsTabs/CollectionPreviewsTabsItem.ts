import type { Schema } from "@superego/schema";

export default interface CollectionPreviewsTabsItem {
  settings: { name: string; icon: string | null };
  schema: Schema;
  exampleDocument?: any;
}
