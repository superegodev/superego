import { CompletionModel, Theme } from "@superego/backend";
import { registerDataRepositoriesTests } from "@superego/executing-backend/tests";
import DemoDataRepositoriesManager from "./DemoDataRepositoriesManager.js";

registerDataRepositoriesTests(async () => {
  const dataRepositoriesManager = new DemoDataRepositoriesManager(
    {
      appearance: { theme: Theme.Auto },
      inference: {
        providers: {
          groq: { apiKey: null },
          openai: { apiKey: null },
          google: { apiKey: null },
          openrouter: { apiKey: null },
        },
        completions: { model: CompletionModel.GroqKimiK2Instruct0905 },
      },
    },
    false,
    crypto.randomUUID().replaceAll("-", ""),
  );
  return { dataRepositoriesManager };
});
