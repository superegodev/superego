import type { RemoteConverters, TypescriptModule } from "@superego/backend";
import type { Schema } from "@superego/schema";

export default interface CreateNewCollectionVersionFormValues {
  schema: Schema;
  contentSummaryGetter: TypescriptModule;
  migration: TypescriptModule | null;
  remoteConverters: RemoteConverters | null;
}
