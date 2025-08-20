import { AICompletionModel, Theme } from "@superego/backend";
import { registerDataRepositoriesTests } from "@superego/executing-backend/tests";
import DemoDataRepositoriesManager from "./DemoDataRepositoriesManager.js";

registerDataRepositoriesTests(async () => {
  const dataRepositoriesManager = new DemoDataRepositoriesManager(
    {
      appearance: { theme: Theme.Auto },
      aiAssistant: {
        providers: { groq: { apiKey: null, baseUrl: null } },
        completions: { defaultModel: AICompletionModel.GroqKimiK2Instruct },
      },
    },
    crypto.randomUUID().replaceAll("-", ""),
  );
  return { dataRepositoriesManager };
});
