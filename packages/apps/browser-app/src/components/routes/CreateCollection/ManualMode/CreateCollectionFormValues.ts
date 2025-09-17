import type { TypescriptModule } from "@superego/backend";
import type { Schema } from "@superego/schema";

export default interface CreateCollectionFormValues {
  name: string;
  icon: string | null;
  description: string | null;
  assistantInstructions: string | null;
  schema: Schema;
  contentSummaryGetter: TypescriptModule;
}
