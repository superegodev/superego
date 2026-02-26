import type { InferenceOptions, InferenceSettings } from "@superego/backend";
import { InferenceProviderDriver } from "@superego/backend";
import { expect, it } from "vitest";
import validateInferenceOptions from "./validateInferenceOptions.js";

const inferenceSettings: InferenceSettings = {
  providers: [
    {
      name: "openrouter",
      baseUrl: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: "apiKey",
      driver: InferenceProviderDriver.OpenRouter,
      models: [
        {
          id: "openai/gpt-oss-120b",
          name: "GPT OSS 120b",
          capabilities: {
            reasoning: true,
            audioUnderstanding: false,
            imageUnderstanding: false,
            pdfUnderstanding: false,
            webSearching: false,
          },
        },
      ],
    },
  ],
  defaults: {
    completion: null,
    transcription: null,
    fileInspection: null,
  },
};

it("returns error when provider is not found", () => {
  // Exercise
  const inferenceOptions: InferenceOptions = {
    providerModelRef: {
      providerName: "unknown",
      modelId: "openai/gpt-oss-120b",
    },
  };
  const result = validateInferenceOptions(inferenceOptions, inferenceSettings);

  // Verify
  expect(result).toEqual({
    name: "InferenceOptionsNotValid",
    details: {
      issues: [
        {
          message: 'Provider "unknown" not found',
          path: [{ key: "providerModelRef" }, { key: "providerName" }],
        },
      ],
    },
  });
});

it("returns error when model is not found", () => {
  // Exercise
  const inferenceOptions: InferenceOptions = {
    providerModelRef: { providerName: "openrouter", modelId: "unknown" },
  };
  const result = validateInferenceOptions(inferenceOptions, inferenceSettings);

  // Verify
  expect(result).toEqual({
    name: "InferenceOptionsNotValid",
    details: {
      issues: [
        {
          message: 'Model "unknown" not found in provider "openrouter"',
          path: [{ key: "providerModelRef" }, { key: "modelId" }],
        },
      ],
    },
  });
});

it("returns null when inference options are valid", () => {
  // Exercise
  const inferenceOptions: InferenceOptions = {
    providerModelRef: {
      providerName: "openrouter",
      modelId: "openai/gpt-oss-120b",
    },
  };
  const result = validateInferenceOptions(inferenceOptions, inferenceSettings);

  // Verify
  expect(result).toBeNull();
});
