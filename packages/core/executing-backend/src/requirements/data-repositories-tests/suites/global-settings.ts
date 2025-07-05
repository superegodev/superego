import { Theme } from "@superego/backend";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { expect, it } from "vitest";
import type Dependencies from "../Dependencies.js";

export default rd<Dependencies>("Global settings", (deps) => {
  it("replacing", async () => {
    // Setup SUT
    const { dataRepositoriesManager } = await deps();
    const initialSettings = {
      theme: Theme.Auto,
    };
    await dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.globalSettings.replace(initialSettings);
        return { action: "commit", returnValue: null };
      },
    );

    // Exercise
    const updatedSettings = {
      theme: Theme.Dark,
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
    const { dataRepositoriesManager } = await deps();
    const settings = {
      theme: Theme.Auto,
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
