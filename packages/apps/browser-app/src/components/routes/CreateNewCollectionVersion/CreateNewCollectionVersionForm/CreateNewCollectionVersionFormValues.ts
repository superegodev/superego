import type {
  DefaultDocumentViewUiOptions,
  TypescriptModule,
} from "@superego/backend";
import type { Schema } from "@superego/schema";

export default interface CreateNewCollectionVersionFormValues {
  schema: Schema;
  contentBlockingKeysGetter: TypescriptModule | null;
  contentSummaryGetter: TypescriptModule;
  defaultDocumentViewUiOptions: DefaultDocumentViewUiOptions | null;
  migration: TypescriptModule;
}
