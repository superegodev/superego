import { AssistantName, Theme } from "@superego/backend";
import { registerDataRepositoriesTests } from "@superego/executing-backend/tests";
import { describe } from "vitest";
import DemoDataRepositoriesManager from "./DemoDataRepositoriesManager.js";

describe("IndexedDB", () => {
  registerDataRepositoriesTests(() => {
    const dataRepositoriesManager = new DemoDataRepositoriesManager(
      {
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
          speech: {
            provider: { baseUrl: null, apiKey: null },
            model: null,
            voice: null,
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
      },
      crypto.randomUUID().replaceAll("-", ""),
    );
    return { dataRepositoriesManager };
  });
});

describe("InMemory", () => {
  registerDataRepositoriesTests(() => {
    const dataRepositoriesManager = new DemoDataRepositoriesManager(
      {
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
          speech: {
            provider: { baseUrl: null, apiKey: null },
            model: null,
            voice: null,
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
      },
      undefined,
      true,
    );
    return { dataRepositoriesManager };
  });
});
