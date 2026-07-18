import { AssistantName, Theme } from "@superego/backend";
import { registerDataRepositoriesTests } from "@superego/executing-backend/tests";
import { beforeAll, beforeEach, expect, it } from "vitest";
import TursoDataRepositoriesManager from "./TursoDataRepositoriesManager.js";

const databaseFilePrefix = `superego-turso-data-repositories-tests-${crypto.randomUUID()}`;
const defaultGlobalSettings = {
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
    userInfo: null,
    userPreferences: null,
    developerPrompts: {
      [AssistantName.Factotum]: null,
      [AssistantName.CollectionCreator]: null,
    },
  },
};

const dataRepositoriesManager = new TursoDataRepositoriesManager({
  fileName: `${databaseFilePrefix}.sqlite`,
  defaultGlobalSettings,
  enableForeignKeyConstraints: false,
});

beforeAll(() => dataRepositoriesManager.runMigrations());
beforeEach(() => dataRepositoriesManager.resetForTests());

registerDataRepositoriesTests(() => ({ dataRepositoriesManager }));

it("exports a logical copy to another OPFS database", async () => {
  // Setup SUT
  const exportedFileName = `${databaseFilePrefix}-export.sqlite`;
  const exportedGlobalSettings = {
    ...defaultGlobalSettings,
    appearance: { theme: Theme.Dark },
  };
  await dataRepositoriesManager.runInSerializableTransaction(async (repos) => {
    await repos.globalSettings.replace(exportedGlobalSettings);
    return { action: "commit", returnValue: null };
  });

  // Exercise
  await dataRepositoriesManager.runInSerializableTransaction(async (repos) => {
    await repos.export(exportedFileName);
    return { action: "commit", returnValue: null };
  });

  // Verify
  const exportedDataRepositoriesManager = new TursoDataRepositoriesManager({
    fileName: exportedFileName,
    defaultGlobalSettings,
  });
  const foundGlobalSettings =
    await exportedDataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.globalSettings.get(),
      }),
    );
  expect(foundGlobalSettings).toEqual(exportedGlobalSettings);
});

it("overwrites an existing exported OPFS database", async () => {
  // Setup SUT
  const exportedFileName = `${databaseFilePrefix}-overwritten-export.sqlite`;
  await dataRepositoriesManager.runInSerializableTransaction(async (repos) => {
    await repos.globalSettings.replace({
      ...defaultGlobalSettings,
      appearance: { theme: Theme.Dark },
    });
    await repos.export(exportedFileName);
    return { action: "commit", returnValue: null };
  });
  const latestGlobalSettings = {
    ...defaultGlobalSettings,
    appearance: { theme: Theme.Light },
  };
  await dataRepositoriesManager.runInSerializableTransaction(async (repos) => {
    await repos.globalSettings.replace(latestGlobalSettings);
    return { action: "commit", returnValue: null };
  });

  // Exercise
  await dataRepositoriesManager.runInSerializableTransaction(async (repos) => {
    await repos.export(exportedFileName);
    return { action: "commit", returnValue: null };
  });

  // Verify
  const exportedDataRepositoriesManager = new TursoDataRepositoriesManager({
    fileName: exportedFileName,
    defaultGlobalSettings,
  });
  const foundGlobalSettings =
    await exportedDataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.globalSettings.get(),
      }),
    );
  expect(foundGlobalSettings).toEqual(latestGlobalSettings);
});
