import type CompletionModel from "../enums/CompletionModel.js";

export default interface AssistantSettings {
  providers: {
    groq: {
      apiKey: string | null;
      baseUrl: string | null;
    };
  };
  completions: {
    defaultModel: CompletionModel;
  };
}
