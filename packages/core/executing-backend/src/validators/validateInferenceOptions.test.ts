import type { InferenceSettings } from "@superego/backend";
import { InferenceProviderDriver } from "@superego/backend";
import { expect, it } from "vitest";
import validateInferenceOptions from "./validateInferenceOptions.js";

const inferenceSettings: InferenceSettings = {
  providers: [
    {
      name: "openrouter",
      baseUrl: "https://openrouter.ai/api/v1/responses",
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
  defaultInferenceOptions: {
    completion: null,
    transcription: null,
    fileInspection: null,
  },
};

it("returns error when completion provider is not found", () => {
  // Exercise
  const inferenceOptions = {
    completion: {
      providerModelRef: {
        providerName: "unknown",
        modelId: "openai/gpt-oss-120b",
      },
    },
    transcription: null,
    fileInspection: null,
  };
  const result = validateInferenceOptions(inferenceOptions, inferenceSettings);

  // Verify
  expect(result).toEqual({
    name: "InferenceOptionsNotValid",
    details: {
      issues: [
        {
          message: 'Provider "unknown" not found',
          path: [
            { key: "completion" },
            { key: "providerModelRef" },
            { key: "providerName" },
          ],
        },
      ],
    },
  });
});

it("returns error when completion model is not found", () => {
  // Exercise
  const inferenceOptions = {
    completion: {
      providerModelRef: { providerName: "openrouter", modelId: "unknown" },
    },
    transcription: null,
    fileInspection: null,
  };
  const result = validateInferenceOptions(inferenceOptions, inferenceSettings);

  // Verify
  expect(result).toEqual({
    name: "InferenceOptionsNotValid",
    details: {
      issues: [
        {
          message: 'Model "unknown" not found in provider "openrouter"',
          path: [
            { key: "completion" },
            { key: "providerModelRef" },
            { key: "modelId" },
          ],
        },
      ],
    },
  });
});

it("returns null when inference options are valid", () => {
  // Exercise
  const inferenceOptions = {
    completion: {
      providerModelRef: {
        providerName: "openrouter",
        modelId: "openai/gpt-oss-120b",
      },
    },
    transcription: null,
    fileInspection: null,
  };
  const result = validateInferenceOptions(inferenceOptions, inferenceSettings);

  // Verify
  expect(result).toBeNull();
});

it("returns null when all fields are null", () => {
  // Exercise
  const inferenceOptions = {
    completion: null,
    transcription: null,
    fileInspection: null,
  };
  const result = validateInferenceOptions(inferenceOptions, inferenceSettings);

  // Verify
  expect(result).toBeNull();
});

it("validates multiple non-null fields", () => {
  // Exercise
  const inferenceOptions = {
    completion: {
      providerModelRef: {
        providerName: "openrouter",
        modelId: "openai/gpt-oss-120b",
      },
    },
    transcription: {
      providerModelRef: { providerName: "unknown", modelId: "some-model" },
    },
    fileInspection: null,
  };
  const result = validateInferenceOptions(inferenceOptions, inferenceSettings);

  // Verify
  expect(result).toEqual({
    name: "InferenceOptionsNotValid",
    details: {
      issues: [
        {
          message: 'Provider "unknown" not found',
          path: [
            { key: "transcription" },
            { key: "providerModelRef" },
            { key: "providerName" },
          ],
        },
      ],
    },
  });
});
