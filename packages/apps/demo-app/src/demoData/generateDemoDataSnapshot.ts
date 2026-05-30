import { AssistantName, Theme } from "@superego/backend";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { FakeTypescriptSandbox } from "@superego/fake-typescript-sandbox/nodejs";
import { MultiDriverInferenceServiceFactory } from "@superego/multi-driver-inference-service";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import { serializeDataSnapshot } from "./dataSnapshot.js";
import { packsWithDocuments } from "./loadDemoData.js";

export default async function generateDemoDataSnapshot(): Promise<string> {
  const dataRepositoriesManager = new DemoDataRepositoriesManager(
    {
      appearance: { theme: Theme.Auto },
      inference: {
        providers: [],
        defaultInferenceOptions: {
          completion: null,
          transcription: null,
          fileInspection: null,
        },
      },
      assistants: {
        userInfo: "Name: Alex. Born: 1990-09-01",
        userPreferences: null,
        developerPrompts: {
          [AssistantName.Factotum]: null,
          [AssistantName.CollectionCreator]: null,
        },
      },
    },
    undefined,
    true,
  );
  const backend = new ExecutingBackend(
    dataRepositoriesManager,
    new FakeTypescriptSandbox(),
    new TscTypescriptCompiler(),
    new MultiDriverInferenceServiceFactory(),
  );

  for (const pack of packsWithDocuments) {
    const result = await backend.packs.install(pack);
    if (!result.success) {
      throw new Error(
        `Failed to install pack ${pack.id}: ${JSON.stringify(result.error)}`,
      );
    }
  }
  const snapshot = await dataRepositoriesManager.exportDataSnapshot();
  if (!snapshot) {
    throw new Error("Demo data snapshot generation produced no data.");
  }
  return serializeDataSnapshot(snapshot);
}
