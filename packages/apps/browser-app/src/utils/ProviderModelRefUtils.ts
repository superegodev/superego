import type { InferenceProviderModelRef } from "@superego/backend";

export default {
  toString(providerModelRef: InferenceProviderModelRef): string {
    return JSON.stringify(providerModelRef);
  },

  fromString(providerModelRef: string): InferenceProviderModelRef {
    return JSON.parse(providerModelRef);
  },
};
