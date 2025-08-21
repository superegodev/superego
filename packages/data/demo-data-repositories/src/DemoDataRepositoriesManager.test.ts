import { CompletionModel, Theme } from "@superego/backend";
import { registerDataRepositoriesTests } from "@superego/executing-backend/tests";
import DemoDataRepositoriesManager from "./DemoDataRepositoriesManager.js";

registerDataRepositoriesTests(async () => {
  const dataRepositoriesManager = new DemoDataRepositoriesManager(
    {
      appearance: { theme: Theme.Auto },
      assistant: {
        providers: { groq: { apiKey: null, baseUrl: null } },
        completions: { defaultModel: CompletionModel.GroqKimiK2Instruct },
      },
    },
    crypto.randomUUID().replaceAll("-", ""),
  );
  return { dataRepositoriesManager };
});
