import {
  InferenceProviderDriver,
  ReasoningEffort,
  Theme,
} from "@superego/backend";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Global Settings", (deps) => {
  const inferenceSettings = {
    providers: [
      {
        name: "providerName",
        baseUrl: "http://localhost",
        apiKey: null,
        driver: InferenceProviderDriver.OpenResponses,
        models: [
          {
            id: "modelId",
            name: "modelId",
            capabilities: {
              audioUnderstanding: false,
              imageUnderstanding: false,
              pdfUnderstanding: false,
              webSearching: false,
            },
          },
        ],
      },
    ],
    defaultInferenceOptions: {
      completion: {
        providerModelRef: {
          providerName: "providerName",
          modelId: "modelId",
        },
        reasoningEffort: ReasoningEffort.Medium,
      },
      transcription: null,
      fileInspection: null,
    },
  };

  describe("get", () => {
    it("success: returns current global settings", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.globalSettings.get();

      // Verify
      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          appearance: { theme: expect.any(String) },
        }),
        error: null,
      });
    });
  });

  describe("update", () => {
    it("error: GlobalSettingsNotValid", async () => {
      // Setup SUT
      const { backend } = deps({ inferenceSettings });

      // Exercise
      const result = await backend.globalSettings.update({
        inference: {
          ...inferenceSettings,
          defaultInferenceOptions: {
            completion: {
              providerModelRef: {
                providerName: "unknownProvider",
                modelId: "unknownModel",
              },
              reasoningEffort: ReasoningEffort.Medium,
            },
            transcription: null,
            fileInspection: null,
          },
        },
      });

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "GlobalSettingsNotValid",
          details: {
            issues: expect.any(Array),
          },
        },
      });
    });

    it("success: updates and persists global settings", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const updateResult = await backend.globalSettings.update({
        appearance: { theme: Theme.Dark },
      });

      // Verify
      expect(updateResult).toEqual({
        success: true,
        data: expect.objectContaining({
          appearance: { theme: Theme.Dark },
        }),
        error: null,
      });
      const getResult = await backend.globalSettings.get();
      expect(getResult).toEqual({
        success: true,
        data: updateResult.data,
        error: null,
      });
    });
  });
});
