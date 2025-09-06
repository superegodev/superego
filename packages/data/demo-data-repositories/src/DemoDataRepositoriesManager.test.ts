import { Theme } from "@superego/backend";
import { registerDataRepositoriesTests } from "@superego/executing-backend/tests";
import DemoDataRepositoriesManager from "./DemoDataRepositoriesManager.js";

registerDataRepositoriesTests(async () => {
  const dataRepositoriesManager = new DemoDataRepositoriesManager(
    {
      appearance: { theme: Theme.Auto },
      assistant: {
        completions: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
        },
        developerPrompt: null,
      },
    },
    false,
    crypto.randomUUID().replaceAll("-", ""),
  );
  return { dataRepositoriesManager };
});
