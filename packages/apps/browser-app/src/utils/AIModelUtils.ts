import type { CompletionModel } from "@superego/backend";

export default {
  getDisplayName(aiModel: CompletionModel): string {
    const [provider, modelId] = aiModel.split("_");
    return `${provider} - ${modelId}`;
  },
};
