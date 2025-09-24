import type { Schema } from "@superego/schema";

export default interface CollectionDefinition {
  name: string;
  schema: Schema;
  contentSummaryGetter: string;
}
