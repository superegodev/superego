import { AssistantName, Theme } from "@superego/backend";
import { registerDataRepositoriesTests } from "@superego/executing-backend/tests";
import DemoDataRepositoriesManager from "./DemoDataRepositoriesManager.js";

registerDataRepositoriesTests(async () => {
  const dataRepositoriesManager = new DemoDataRepositoriesManager(
    {
      appearance: { theme: Theme.Auto },
      inference: {
        completions: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
        },
        transcriptions: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
        },
        speech: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
          voice: null,
        },
      },
      assistants: {
        developerPrompts: {
          [AssistantName.Factotum]: null,
          [AssistantName.CollectionManager]: null,
        },
      },
    },
    false,
    crypto.randomUUID().replaceAll("-", ""),
  );
  return { dataRepositoriesManager };
});
