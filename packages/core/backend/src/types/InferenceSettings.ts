import type CompletionModel from "../enums/CompletionModel.js";

export default interface InferenceSettings {
  providers: {
    groq: {
      apiKey: string | null;
    };
    openai: {
      apiKey: string | null;
    };
    google: {
      apiKey: string | null;
    };
    openrouter: {
      apiKey: string | null;
    };
  };
  completions: {
    model: CompletionModel;
  };
}
