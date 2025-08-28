import { CompletionModel, Theme } from "@superego/backend";
import { registerDataRepositoriesTests } from "@superego/executing-backend/tests";
import DemoDataRepositoriesManager from "./DemoDataRepositoriesManager.js";

registerDataRepositoriesTests(async () => {
  const dataRepositoriesManager = new DemoDataRepositoriesManager(
    {
      appearance: { theme: Theme.Auto },
      inference: {
        providers: { groq: { apiKey: null, baseUrl: null } },
        completions: { defaultModel: CompletionModel.GroqKimiK2Instruct },
      },
    },
    false,
    crypto.randomUUID().replaceAll("-", ""),
  );
  return { dataRepositoriesManager };
});
