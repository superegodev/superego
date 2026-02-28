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
      driver: InferenceProviderDriver.OpenResponses,
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
        {
          id: "openai/gpt-audio-120b",
          name: "GPT Audio 120b",
          capabilities: {
            reasoning: true,
            audioUnderstanding: true,
            imageUnderstanding: false,
            pdfUnderstanding: false,
            webSearching: false,
          },
        },
        {
          id: "openai/gpt-vision-120b",
          name: "GPT Vision 120b",
          capabilities: {
            reasoning: true,
            audioUnderstanding: false,
            imageUnderstanding: true,
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
  expect(result).toEqual([
    {
      message: 'Provider "unknown" not found',
      path: [{ key: "completion" }],
    },
  ]);
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
  expect(result).toEqual([
    {
      message: 'Model "unknown" not found in provider "openrouter"',
      path: [{ key: "completion" }],
    },
  ]);
});

it("returns no issues when inference options are valid", () => {
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
  expect(result).toEqual([]);
});

it("returns no issues when all fields are null", () => {
  // Exercise
  const inferenceOptions = {
    completion: null,
    transcription: null,
    fileInspection: null,
  };
  const result = validateInferenceOptions(inferenceOptions, inferenceSettings);

  // Verify
  expect(result).toEqual([]);
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
  expect(result).toEqual([
    {
      message: 'Provider "unknown" not found',
      path: [{ key: "transcription" }],
    },
  ]);
});

it("returns error when transcription model lacks audio understanding", () => {
  // Exercise
  const inferenceOptions = {
    completion: null,
    transcription: {
      providerModelRef: {
        providerName: "openrouter",
        modelId: "openai/gpt-oss-120b",
      },
    },
    fileInspection: null,
  };
  const result = validateInferenceOptions(inferenceOptions, inferenceSettings);

  // Verify
  expect(result).toEqual([
    {
      message:
        'Model "openai/gpt-oss-120b" does not support audio understanding, required for transcription',
      path: [{ key: "transcription" }],
    },
  ]);
});

it("returns no issues when transcription model has audio understanding", () => {
  // Exercise
  const inferenceOptions = {
    completion: null,
    transcription: {
      providerModelRef: {
        providerName: "openrouter",
        modelId: "openai/gpt-audio-120b",
      },
    },
    fileInspection: null,
  };
  const result = validateInferenceOptions(inferenceOptions, inferenceSettings);

  // Verify
  expect(result).toEqual([]);
});

it("returns error when file inspection model lacks all file understanding capabilities", () => {
  // Exercise
  const inferenceOptions = {
    completion: null,
    transcription: null,
    fileInspection: {
      providerModelRef: {
        providerName: "openrouter",
        modelId: "openai/gpt-oss-120b",
      },
    },
  };
  const result = validateInferenceOptions(inferenceOptions, inferenceSettings);

  // Verify
  expect(result).toEqual([
    {
      message:
        'Model "openai/gpt-oss-120b" does not support any file understanding capability (audio, image, or PDF), required for file inspection',
      path: [{ key: "fileInspection" }],
    },
  ]);
});

it("returns no issues when file inspection model has image understanding", () => {
  // Exercise
  const inferenceOptions = {
    completion: null,
    transcription: null,
    fileInspection: {
      providerModelRef: {
        providerName: "openrouter",
        modelId: "openai/gpt-vision-120b",
      },
    },
  };
  const result = validateInferenceOptions(inferenceOptions, inferenceSettings);

  // Verify
  expect(result).toEqual([]);
});

it("returns no issues when file inspection model has audio understanding", () => {
  // Exercise
  const inferenceOptions = {
    completion: null,
    transcription: null,
    fileInspection: {
      providerModelRef: {
        providerName: "openrouter",
        modelId: "openai/gpt-audio-120b",
      },
    },
  };
  const result = validateInferenceOptions(inferenceOptions, inferenceSettings);

  // Verify
  expect(result).toEqual([]);
});
