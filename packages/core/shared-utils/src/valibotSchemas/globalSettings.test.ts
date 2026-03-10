import {
  AssistantName,
  type GlobalSettings,
  InferenceProviderDriver,
  ReasoningEffort,
  Theme,
  type ValidationIssue,
} from "@superego/backend";
import * as v from "valibot";
import { expect, it } from "vitest";
import globalSettings from "./globalSettings.js";

//////////////////////////////
// Test function definition //
//////////////////////////////

interface TestCase {
  settings: GlobalSettings;
  expectedIssues: ValidationIssue[];
}
const test = (
  name: string,
  { settings, expectedIssues }: TestCase,
  only?: boolean,
) => {
  it(name, { only: only ?? false }, () => {
    // Setup SUT
    const schema = globalSettings();

    // Exercise
    const result = v.safeParse(schema, settings);

    // Verify
    if (expectedIssues.length === 0) {
      expect(result.success).toBe(true);
    } else {
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.issues.map((issue) => ({
          message: issue.message,
          path: issue.path?.map((segment) => ({ key: segment.key })),
        }));
        expect(issues).toEqual(expectedIssues);
      }
    }
  });
};
test.only = (name: string, testCase: TestCase) => test(name, testCase, true);

///////////
// Tests //
///////////

test("valid settings with all null inference options returns no issues", {
  settings: {
    appearance: { theme: Theme.Auto },
    inference: {
      providers: [
        {
          name: "providerName",
          baseUrl: "http://localhost",
          apiKey: null,
          driver: InferenceProviderDriver.OpenResponses,
          models: [
            {
              id: "modelId",
              name: "Model",
              capabilities: {
                audioUnderstanding: true,
                imageUnderstanding: false,
                pdfUnderstanding: false,
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
    },
    assistants: {
      userInfo: null,
      userPreferences: null,
      developerPrompts: {
        [AssistantName.CollectionCreator]: null,
        [AssistantName.Factotum]: null,
      },
    },
  },
  expectedIssues: [],
});

test("valid settings with completion returns no issues", {
  settings: {
    appearance: { theme: Theme.Auto },
    inference: {
      providers: [
        {
          name: "providerName",
          baseUrl: "http://localhost",
          apiKey: null,
          driver: InferenceProviderDriver.OpenResponses,
          models: [
            {
              id: "modelId",
              name: "Model",
              capabilities: {
                audioUnderstanding: true,
                imageUnderstanding: false,
                pdfUnderstanding: false,
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
    },
    assistants: {
      userInfo: null,
      userPreferences: null,
      developerPrompts: {
        [AssistantName.CollectionCreator]: null,
        [AssistantName.Factotum]: null,
      },
    },
  },
  expectedIssues: [],
});

test("completion referencing unknown provider returns issue", {
  settings: {
    appearance: { theme: Theme.Auto },
    inference: {
      providers: [
        {
          name: "providerName",
          baseUrl: "http://localhost",
          apiKey: null,
          driver: InferenceProviderDriver.OpenResponses,
          models: [
            {
              id: "modelId",
              name: "Model",
              capabilities: {
                audioUnderstanding: true,
                imageUnderstanding: false,
                pdfUnderstanding: false,
              },
            },
          ],
        },
      ],
      defaultInferenceOptions: {
        completion: {
          providerModelRef: {
            providerName: "unknown",
            modelId: "modelId",
          },
          reasoningEffort: ReasoningEffort.Medium,
        },
        transcription: null,
        fileInspection: null,
      },
    },
    assistants: {
      userInfo: null,
      userPreferences: null,
      developerPrompts: {
        [AssistantName.CollectionCreator]: null,
        [AssistantName.Factotum]: null,
      },
    },
  },
  expectedIssues: [
    {
      message: 'Provider "unknown" not found',
      path: [
        { key: "inference" },
        { key: "defaultInferenceOptions" },
        { key: "completion" },
        { key: "providerModelRef" },
      ],
    },
  ],
});

test("completion referencing unknown model returns issue", {
  settings: {
    appearance: { theme: Theme.Auto },
    inference: {
      providers: [
        {
          name: "providerName",
          baseUrl: "http://localhost",
          apiKey: null,
          driver: InferenceProviderDriver.OpenResponses,
          models: [
            {
              id: "modelId",
              name: "Model",
              capabilities: {
                audioUnderstanding: true,
                imageUnderstanding: false,
                pdfUnderstanding: false,
              },
            },
          ],
        },
      ],
      defaultInferenceOptions: {
        completion: {
          providerModelRef: {
            providerName: "providerName",
            modelId: "unknown",
          },
          reasoningEffort: ReasoningEffort.Medium,
        },
        transcription: null,
        fileInspection: null,
      },
    },
    assistants: {
      userInfo: null,
      userPreferences: null,
      developerPrompts: {
        [AssistantName.CollectionCreator]: null,
        [AssistantName.Factotum]: null,
      },
    },
  },
  expectedIssues: [
    {
      message: 'Model "unknown" not found in provider "providerName"',
      path: [
        { key: "inference" },
        { key: "defaultInferenceOptions" },
        { key: "completion" },
        { key: "providerModelRef" },
      ],
    },
  ],
});

test("transcription model without audio understanding returns issue", {
  settings: {
    appearance: { theme: Theme.Auto },
    inference: {
      providers: [
        {
          name: "providerName",
          baseUrl: "http://localhost",
          apiKey: null,
          driver: InferenceProviderDriver.OpenResponses,
          models: [
            {
              id: "modelId",
              name: "Model",
              capabilities: {
                audioUnderstanding: false,
                imageUnderstanding: false,
                pdfUnderstanding: false,
              },
            },
          ],
        },
      ],
      defaultInferenceOptions: {
        completion: null,
        transcription: {
          providerModelRef: {
            providerName: "providerName",
            modelId: "modelId",
          },
        },
        fileInspection: null,
      },
    },
    assistants: {
      userInfo: null,
      userPreferences: null,
      developerPrompts: {
        [AssistantName.CollectionCreator]: null,
        [AssistantName.Factotum]: null,
      },
    },
  },
  expectedIssues: [
    {
      message:
        'Model "modelId" does not support audio understanding, required for transcription',
      path: [
        { key: "inference" },
        { key: "defaultInferenceOptions" },
        { key: "transcription" },
        { key: "providerModelRef" },
      ],
    },
  ],
});

test("valid transcription model with audio understanding returns no issues", {
  settings: {
    appearance: { theme: Theme.Auto },
    inference: {
      providers: [
        {
          name: "providerName",
          baseUrl: "http://localhost",
          apiKey: null,
          driver: InferenceProviderDriver.OpenResponses,
          models: [
            {
              id: "modelId",
              name: "Model",
              capabilities: {
                audioUnderstanding: true,
                imageUnderstanding: false,
                pdfUnderstanding: false,
              },
            },
          ],
        },
      ],
      defaultInferenceOptions: {
        completion: null,
        transcription: {
          providerModelRef: {
            providerName: "providerName",
            modelId: "modelId",
          },
        },
        fileInspection: null,
      },
    },
    assistants: {
      userInfo: null,
      userPreferences: null,
      developerPrompts: {
        [AssistantName.CollectionCreator]: null,
        [AssistantName.Factotum]: null,
      },
    },
  },
  expectedIssues: [],
});

test(
  "file inspection model without any file understanding capability returns issue",
  {
    settings: {
      appearance: { theme: Theme.Auto },
      inference: {
        providers: [
          {
            name: "providerName",
            baseUrl: "http://localhost",
            apiKey: null,
            driver: InferenceProviderDriver.OpenResponses,
            models: [
              {
                id: "modelId",
                name: "Model",
                capabilities: {
                  audioUnderstanding: false,
                  imageUnderstanding: false,
                  pdfUnderstanding: false,
                },
              },
            ],
          },
        ],
        defaultInferenceOptions: {
          completion: null,
          transcription: null,
          fileInspection: {
            providerModelRef: {
              providerName: "providerName",
              modelId: "modelId",
            },
          },
        },
      },
      assistants: {
        userInfo: null,
        userPreferences: null,
        developerPrompts: {
          [AssistantName.CollectionCreator]: null,
          [AssistantName.Factotum]: null,
        },
      },
    },
    expectedIssues: [
      {
        message:
          'Model "modelId" does not support any file understanding capability (audio, image, or PDF), required for file inspection',
        path: [
          { key: "inference" },
          { key: "defaultInferenceOptions" },
          { key: "fileInspection" },
          { key: "providerModelRef" },
        ],
      },
    ],
  },
);
