import type AICompletionModel from "../enums/AICompletionModel.js";

export default interface AISettings {
  providers: {
    groq: {
      apiKey: string | null;
      baseUrl: string | null;
    };
  };
  completions: {
    defaultModel: AICompletionModel;
  };
}
