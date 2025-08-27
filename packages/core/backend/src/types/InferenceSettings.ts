import type CompletionModel from "../enums/CompletionModel.js";

export default interface InferenceSettings {
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
