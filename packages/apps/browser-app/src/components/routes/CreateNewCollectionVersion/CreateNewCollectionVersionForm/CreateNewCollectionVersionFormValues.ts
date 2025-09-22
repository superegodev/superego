import type { TypescriptModule } from "@superego/backend";
import type { Schema } from "@superego/schema";

export default interface CreateNewCollectionVersionFormValues {
  schema: Schema;
  migration: TypescriptModule;
  contentSummaryGetter: TypescriptModule;
}
