import type { AICompletionModel } from "@superego/backend";

export default {
  getDisplayName(aiModel: AICompletionModel): string {
    const [provider, modelId] = aiModel.split("_");
    return `${provider} - ${modelId}`;
  },
};
