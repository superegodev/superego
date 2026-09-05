import {
  InferenceProviderDriver,
  MessageContentPartType,
  MessageRole,
  ReasoningEffort,
  ToolName,
} from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";

export default rd<GetDependencies>("Inference", (deps) => {
  const validInferenceOptions = {
    completion: {
      providerModelRef: {
        providerName: "providerName",
        modelId: "modelId",
      },
      reasoningEffort: ReasoningEffort.Medium,
    },
    transcription: {
      providerModelRef: {
        providerName: "providerName",
        modelId: "modelId",
      },
    },
    fileInspection: null,
  };

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
  };

  const invalidInferenceOptions = {
    completion: {
      providerModelRef: {
        providerName: "unknownProvider",
        modelId: "unknownModel",
      },
      reasoningEffort: ReasoningEffort.Medium,
    },
    transcription: {
      providerModelRef: {
        providerName: "unknownProvider",
        modelId: "unknownModel",
      },
    },
    fileInspection: null,
  };

  describe("stt", () => {
    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.inference.stt({} as any, {
        completion: null,
        transcription: {
          providerModelRef: { providerName: "p", modelId: "m" },
        },
        fileInspection: null,
      });

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

    it("error: InferenceOptionsNotValid", async () => {
      // Setup SUT
      const { backend } = deps({ inferenceSettings });

      // Exercise
      const result = await backend.inference.stt(
        { content: new Uint8Array(), contentType: "audio/wav" },
        invalidInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "InferenceOptionsNotValid",
          details: {
            issues: expect.any(Array),
          },
        },
      });
    });

    it("success: transcribes audio", async () => {
      // Setup SUT
      const sttService: InferenceService = {
        generateNextMessage: async (_msgs, _tools, inferenceOptions) => ({
          id: Id.generate.message(),
          role: MessageRole.Assistant,
          content: [{ type: MessageContentPartType.Text, text: "Mock" }],
          reasoning: {},
          inferenceOptions,
          generationStats: {
            timeTaken: 0,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
          },
          createdAt: new Date(),
        }),
        stt: async () => "Transcribed text",
        inspectFile: async () => "Mock",
      };
      const { backend } = deps({ inferenceService: sttService });

      // Exercise
      const result = await backend.inference.stt(
        { content: new Uint8Array(), contentType: "audio/wav" },
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: true,
        data: "Transcribed text",
        error: null,
      });
    });
  });

  describe("implementTypescriptModule", () => {
    const minimalSpec = {
      description: "A simple module",
      rules: null,
      additionalInstructions: null,
      template:
        "export default function getContentSummary(): Record<string, string>;",
      libs: [] as {
        path: `/${string}.ts` | `/${string}.tsx`;
        source: string;
      }[],
      startingPoint: {
        path: "/main.ts" as const,
        source: "",
      },
      userRequest: "Implement the module",
    };

    it("error: ArgumentsNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.inference.implementTypescriptModule(
        {} as any,
        validInferenceOptions,
      );

      // Verify
      assert(!result.success);
      expect(result.error.name).toBe("ArgumentsNotValid");
    });

    it("error: InferenceOptionsNotValid", async () => {
      // Setup SUT
      const { backend } = deps({ inferenceSettings });

      // Exercise
      const result = await backend.inference.implementTypescriptModule(
        minimalSpec,
        invalidInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "InferenceOptionsNotValid",
          details: {
            issues: expect.any(Array),
          },
        },
      });
    });

    it("error: WriteTypescriptModuleToolNotCalled", async () => {
      // Setup SUT
      const noToolCallService: InferenceService = {
        generateNextMessage: async (_msgs, _tools, inferenceOptions) => ({
          id: Id.generate.message(),
          role: MessageRole.Assistant,
          content: [
            {
              type: MessageContentPartType.Text,
              text: "Here is the code...",
            },
          ],
          reasoning: {},
          inferenceOptions,
          generationStats: {
            timeTaken: 0,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
          },
          createdAt: new Date(),
        }),
        stt: async () => "Mock",
        inspectFile: async () => "Mock",
      };
      const { backend } = deps({ inferenceService: noToolCallService });

      // Exercise
      const result = await backend.inference.implementTypescriptModule(
        minimalSpec,
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "WriteTypescriptModuleToolNotCalled",
          details: {
            generatedMessage: expect.objectContaining({
              role: MessageRole.Assistant,
            }),
          },
        },
      });
    });

    // Skipped in browser: MonacoTypescriptCompiler's TS worker hangs in
    // headless chromium.
    it.skipIf(typeof window !== "undefined")(
      "error: TooManyFailedImplementationAttempts",
      async () => {
        // Setup SUT
        const badCodeService: InferenceService = {
          generateNextMessage: async (_msgs, _tools, inferenceOptions) => ({
            id: Id.generate.message(),
            role: MessageRole.Assistant,
            toolCalls: [
              {
                id: "call-1",
                tool: ToolName.WriteTypescriptModule,
                input: { source: "const x: number = 'not a number';" },
              },
            ],
            reasoning: {},
            inferenceOptions,
            generationStats: {
              timeTaken: 0,
              inputTokens: 0,
              outputTokens: 0,
              totalTokens: 0,
            },
            createdAt: new Date(),
          }),
          stt: async () => "Mock",
          inspectFile: async () => "Mock",
        };
        const { backend } = deps({ inferenceService: badCodeService });

        // Exercise
        const result = await backend.inference.implementTypescriptModule(
          minimalSpec,
          validInferenceOptions,
        );

        // Verify
        expect(result).toEqual({
          success: false,
          data: null,
          error: {
            name: "TooManyFailedImplementationAttempts",
            details: {
              failedAttemptsCount: 5,
            },
          },
        });
      },
    );

    // Skipped in browser: MonacoTypescriptCompiler's TS worker hangs in
    // headless chromium.
    it.skipIf(typeof window !== "undefined")(
      "success: implements typescript module",
      async () => {
        // Setup SUT
        const goodCodeService: InferenceService = {
          generateNextMessage: async (_msgs, _tools, inferenceOptions) => ({
            id: Id.generate.message(),
            role: MessageRole.Assistant,
            toolCalls: [
              {
                id: "call-1",
                tool: ToolName.WriteTypescriptModule,
                input: {
                  source:
                    "export default function getContentSummary(): Record<string, string> { return {}; }",
                },
              },
            ],
            reasoning: {},
            inferenceOptions,
            generationStats: {
              timeTaken: 0,
              inputTokens: 0,
              outputTokens: 0,
              totalTokens: 0,
            },
            createdAt: new Date(),
          }),
          stt: async () => "Mock",
          inspectFile: async () => "Mock",
        };
        const { backend } = deps({ inferenceService: goodCodeService });

        // Exercise
        const result = await backend.inference.implementTypescriptModule(
          minimalSpec,
          validInferenceOptions,
        );

        // Verify
        assert.isTrue(result.success);
        expect(result.data).toEqual({
          source: expect.any(String),
          compiled: expect.any(String),
        });
        expect(result.data.source).toContain("getContentSummary");
      },
    );
  });
  describe("implementApp", () => {
    const request = {
      description: "An app",
      rules: null,
      additionalInstructions: null,
      template: "export default function App(): number;",
      libs: [],
      startingPoint: {
        path: "/main.tsx" as const,
        source: "export default function App() { return 1; }",
      },
      userRequest: "Display two",
      spec: "# App\nDisplay one.",
    };

    it
      .skipIf(typeof window !== "undefined")
      .each([
        "missing",
        "invalid",
        "compile failure",
        "retry",
        "success",
        "initial",
      ])("handles %s", async (scenario) => {
      // Setup mocks
      let attempts = 0;
      const inferenceService: InferenceService = {
        generateNextMessage: async (messages, tools, inferenceOptions) => {
          attempts += 1;
          expect(JSON.stringify(messages)).toContain("Display two");
          expect(JSON.stringify(messages)).toContain(
            "Current app specification",
          );
          expect(tools[0]?.inputSchema.required).toEqual(["source", "spec"]);
          const source =
            scenario === "compile failure" ||
            (scenario === "retry" && attempts === 1)
              ? "const value: number = 'wrong';"
              : "export default function App() { return 2; }";
          return {
            id: Id.generate.message(),
            role: MessageRole.Assistant,
            toolCalls: [
              {
                id: "call-1",
                tool: ToolName.WriteTypescriptModule,
                input: {
                  source,
                  ...(scenario === "missing"
                    ? {}
                    : {
                        spec:
                          scenario === "invalid"
                            ? (42 as any)
                            : "# App\nDisplay two.",
                      }),
                },
              },
            ],
            reasoning: {},
            inferenceOptions,
            generationStats: {
              timeTaken: 0,
              inputTokens: 0,
              outputTokens: 0,
              totalTokens: 0,
            },
            createdAt: new Date(),
          };
        },
        stt: async () => "Mock",
        inspectFile: async () => "Mock",
      };
      // Setup SUT
      const { backend } = deps({ inferenceService });

      // Exercise
      const result = await backend.inference.implementApp(
        { ...request, spec: scenario === "initial" ? "" : request.spec },
        validInferenceOptions,
      );

      // Verify
      if (scenario === "missing" || scenario === "invalid") {
        expect(result.error?.name).toBe("WriteTypescriptModuleToolNotCalled");
        expect(attempts).toBe(5);
      } else if (scenario === "compile failure") {
        expect(result.error?.name).toBe("TooManyFailedImplementationAttempts");
        expect(attempts).toBe(5);
      } else {
        assert(result.success);
        expect(result.data.spec).toBe("# App\nDisplay two.");
        expect(result.data.files["/main.tsx"].source).toContain("return 2");
        expect(result.data.files["/main.tsx"].compiled).toContain("return 2");
        expect(attempts).toBe(scenario === "retry" ? 2 : 1);
      }
      expect(request.spec).toBe("# App\nDisplay one.");
    });
  });
});
