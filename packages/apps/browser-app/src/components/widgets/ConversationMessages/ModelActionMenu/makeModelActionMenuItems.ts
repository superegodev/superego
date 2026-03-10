import type {
  InferenceProvider,
  InferenceProviderModelRef,
} from "@superego/backend";
import type ModelActionMenuItem from "./ModelActionMenuItem.js";

export default function makeModelActionMenuItems(
  providers: InferenceProvider[],
  previouslyUsedRef: InferenceProviderModelRef | null,
): ModelActionMenuItem[] {
  return providers.flatMap((provider) =>
    provider.models.map((model) => ({
      providerModelRef: { providerName: provider.name, modelId: model.id },
      label: model.name,
      providerLabel: provider.name,
      isPreviouslyUsed:
        previouslyUsedRef !== null &&
        previouslyUsedRef.providerName === provider.name &&
        previouslyUsedRef.modelId === model.id,
    })),
  );
}
