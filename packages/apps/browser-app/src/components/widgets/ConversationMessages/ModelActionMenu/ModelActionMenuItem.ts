import type { InferenceProviderModelRef } from "@superego/backend";

export default interface ModelActionMenuItem {
  providerModelRef: InferenceProviderModelRef;
  label: string;
  providerLabel: string;
  isPreviouslyUsed: boolean;
}
