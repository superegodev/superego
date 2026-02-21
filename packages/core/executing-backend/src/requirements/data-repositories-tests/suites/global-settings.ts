import { AssistantName, type GlobalSettings, Theme } from "@superego/backend";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Global settings", (deps) => {
  it("replacing", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();
    const settings: GlobalSettings = {
      appearance: { theme: Theme.Auto },
      inference: {
        chatCompletions: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
        },
        transcriptions: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
        },
        fileInspection: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
        },
      },
      assistants: {
        userName: null,
        developerPrompts: {
          [AssistantName.Factotum]: null,
          [AssistantName.CollectionCreator]: null,
        },
      },
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.globalSettings.replace(settings);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const updatedSettings: GlobalSettings = {
      appearance: { theme: Theme.Auto },
      inference: {
        chatCompletions: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
        },
        transcriptions: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
        },
        fileInspection: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
        },
      },
      assistants: {
        userName: null,
        developerPrompts: {
          [AssistantName.Factotum]: null,
          [AssistantName.CollectionCreator]: null,
        },
      },
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.globalSettings.replace(updatedSettings);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.globalSettings.get(),
      }),
    );
    expect(found).toEqual(updatedSettings);
  });

  it("getting", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = deps();
    const settings: GlobalSettings = {
      appearance: { theme: Theme.Auto },
      inference: {
        chatCompletions: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
        },
        transcriptions: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
        },
        fileInspection: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
        },
      },
      assistants: {
        userName: null,
        developerPrompts: {
          [AssistantName.Factotum]: null,
          [AssistantName.CollectionCreator]: null,
        },
      },
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.globalSettings.replace(settings);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const found = await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => ({
        action: "commit",
        returnValue: await repos.globalSettings.get(),
      }),
    );

    // Verify
    expect(found).toEqual(settings);
  });
});
