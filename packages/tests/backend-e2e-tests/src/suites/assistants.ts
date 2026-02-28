import {
  AssistantName,
  ConversationStatus,
  InferenceProviderDriver,
  MessageContentPartType,
  MessageRole,
  ToolName,
} from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { registeredDescribe as rd } from "@superego/vitest-registered";
import { assert, describe, expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";
import waitForConversationProcessing from "../utils/waitForConversationProcessing.js";

export default rd<GetDependencies>("Assistants", (deps) => {
  const validInferenceOptions = {
    completion: {
      providerModelRef: {
        providerName: "providerName",
        modelId: "modelId",
      },
    },
    transcription: null,
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
              reasoning: false,
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
    },
    transcription: null,
    fileInspection: null,
  };

  describe("startConversation", () => {
    it("error: InferenceOptionsNotValid", async () => {
      // Setup SUT
      const { backend } = deps({ inferenceSettings });

      // Exercise
      const result = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
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

    it("error: FilesNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const fileId = Id.generate.file();
      const result = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [
          { type: MessageContentPartType.Text, text: "Hello" },
          {
            type: MessageContentPartType.File,
            file: {
              id: fileId,
              name: "test.pdf",
              mimeType: "application/pdf",
            },
          },
        ],
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "FilesNotFound",
          details: {
            fileIds: [fileId],
          },
        },
      });
    });

    it("success: starts a conversation", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );

      // Verify
      assert.isTrue(result.success);
      expect(result.data).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          assistant: AssistantName.Factotum,
          status: ConversationStatus.Processing,
        }),
      );
      expect(result.data.messages).toHaveLength(1);
      expect(result.data.messages[0]).toEqual(
        expect.objectContaining({
          role: MessageRole.User,
          content: [{ type: MessageContentPartType.Text, text: "Hello" }],
        }),
      );
    });
  });

  describe("continueConversation", () => {
    it("error: InferenceOptionsNotValid", async () => {
      // Setup SUT
      const { backend } = deps({ inferenceSettings });

      // Exercise
      const result = await backend.assistants.continueConversation(
        Id.generate.conversation(),
        [{ type: MessageContentPartType.Text, text: "Follow up" }],
        invalidInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "InferenceOptionsNotValid",
          details: { issues: expect.any(Array) },
        },
      });
    });

    it("error: ConversationNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const conversationId = Id.generate.conversation();
      const result = await backend.assistants.continueConversation(
        conversationId,
        [{ type: MessageContentPartType.Text, text: "Follow up" }],
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConversationNotFound",
          details: { conversationId },
        },
      });
    });

    it("error: CannotContinueConversation (reason: ConversationIsProcessing)", async () => {
      // Setup SUT
      const neverResolvingInferenceService: InferenceService = {
        generateNextMessage: () => new Promise(() => {}),
        stt: () => new Promise(() => {}),
        inspectFile: () => new Promise(() => {}),
      };
      const { backend } = deps({
        inferenceService: neverResolvingInferenceService,
      });
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);

      // Exercise
      const result = await backend.assistants.continueConversation(
        startResult.data.id,
        [{ type: MessageContentPartType.Text, text: "Follow up" }],
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CannotContinueConversation",
          details: {
            conversationId: startResult.data.id,
            reason: "ConversationIsProcessing",
          },
        },
      });
    });

    it("error: CannotContinueConversation (reason: ConversationHasError)", async () => {
      // Setup SUT
      const throwingInferenceService: InferenceService = {
        generateNextMessage: async () => {
          throw new Error("Test error");
        },
        stt: async () => {
          throw new Error("Test error");
        },
        inspectFile: async () => {
          throw new Error("Test error");
        },
      };
      const { backend } = deps({ inferenceService: throwingInferenceService });
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);
      await waitForConversationProcessing(backend, startResult.data.id);

      // Exercise
      const result = await backend.assistants.continueConversation(
        startResult.data.id,
        [{ type: MessageContentPartType.Text, text: "Follow up" }],
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CannotContinueConversation",
          details: {
            conversationId: startResult.data.id,
            reason: "ConversationHasError",
          },
        },
      });
    });

    it("error: CannotContinueConversation (reason: ConversationHasOutdatedContext)", async () => {
      // Setup SUT
      const { backend } = deps();
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);
      await waitForConversationProcessing(backend, startResult.data.id);
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "new-collection",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: { dataType: DataType.Struct, properties: {} },
          },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const result = await backend.assistants.continueConversation(
        startResult.data.id,
        [{ type: MessageContentPartType.Text, text: "Follow up" }],
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CannotContinueConversation",
          details: {
            conversationId: startResult.data.id,
            reason: "ConversationHasOutdatedContext",
          },
        },
      });
    });

    it("error: FilesNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);
      await waitForConversationProcessing(backend, startResult.data.id);
      const fileId = Id.generate.file();

      // Exercise
      const result = await backend.assistants.continueConversation(
        startResult.data.id,
        [
          { type: MessageContentPartType.Text, text: "Follow up" },
          {
            type: MessageContentPartType.File,
            file: {
              id: fileId,
              name: "test.pdf",
              mimeType: "application/pdf",
            },
          },
        ] as any,
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "FilesNotFound",
          details: { fileIds: [fileId] },
        },
      });
    });

    it("success: continues a conversation", async () => {
      // Setup SUT
      const { backend } = deps();
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);
      await waitForConversationProcessing(backend, startResult.data.id);

      // Exercise
      const result = await backend.assistants.continueConversation(
        startResult.data.id,
        [{ type: MessageContentPartType.Text, text: "Follow up" }],
        validInferenceOptions,
      );

      // Verify
      assert.isTrue(result.success);
      expect(result.data).toEqual(
        expect.objectContaining({
          id: startResult.data.id,
          status: ConversationStatus.Processing,
        }),
      );
    });
  });

  describe("retryLastResponse", () => {
    it("error: InferenceOptionsNotValid", async () => {
      // Setup SUT
      const { backend } = deps({ inferenceSettings });

      // Exercise
      const result = await backend.assistants.retryLastResponse(
        Id.generate.conversation(),
        invalidInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "InferenceOptionsNotValid",
          details: { issues: expect.any(Array) },
        },
      });
    });

    it("error: ConversationNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const conversationId = Id.generate.conversation();

      // Exercise
      const result = await backend.assistants.retryLastResponse(
        conversationId,
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConversationNotFound",
          details: { conversationId },
        },
      });
    });

    it("error: CannotRetryLastResponse (reason: ConversationIsProcessing)", async () => {
      // Setup SUT
      const neverResolvingInferenceService: InferenceService = {
        generateNextMessage: () => new Promise(() => {}),
        stt: () => new Promise(() => {}),
        inspectFile: () => new Promise(() => {}),
      };
      const { backend } = deps({
        inferenceService: neverResolvingInferenceService,
      });
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);

      // Exercise
      const result = await backend.assistants.retryLastResponse(
        startResult.data.id,
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CannotRetryLastResponse",
          details: {
            conversationId: startResult.data.id,
            reason: "ConversationIsProcessing",
          },
        },
      });
    });

    it("error: CannotRetryLastResponse (reason: ConversationHasError)", async () => {
      // Setup SUT
      const throwingInferenceService: InferenceService = {
        generateNextMessage: async () => {
          throw new Error("Test error");
        },
        stt: async () => {
          throw new Error("Test error");
        },
        inspectFile: async () => {
          throw new Error("Test error");
        },
      };
      const { backend } = deps({ inferenceService: throwingInferenceService });
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);
      await waitForConversationProcessing(backend, startResult.data.id);

      // Exercise
      const result = await backend.assistants.retryLastResponse(
        startResult.data.id,
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CannotRetryLastResponse",
          details: {
            conversationId: startResult.data.id,
            reason: "ConversationHasError",
          },
        },
      });
    });

    it("error: CannotRetryLastResponse (reason: ResponseHadSideEffects)", async () => {
      // Setup SUT
      let collectionId = "";
      let callCount = 0;
      const sideEffectsInferenceService: InferenceService = {
        generateNextMessage: async (_messages, _tools, inferenceOptions) => {
          callCount++;
          if (callCount === 1) {
            return {
              role: MessageRole.Assistant,
              toolCalls: [
                {
                  id: "call-1",
                  tool: ToolName.CreateDocuments,
                  input: {
                    documents: [{ collectionId, content: { title: "Test" } }],
                  },
                },
              ],
              inferenceOptions,
              createdAt: new Date(),
            };
          }
          return {
            role: MessageRole.Assistant,
            content: [{ type: MessageContentPartType.Text, text: "Done" }],
            inferenceOptions,
            createdAt: new Date(),
          };
        },
        stt: async () => "Mock",
        inspectFile: async () => "Mock",
      };
      const { backend } = deps({
        inferenceService: sideEffectsInferenceService,
      });
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "side-effects-collection",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: { title: { dataType: DataType.String } },
            },
          },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);
      collectionId = createCollectionResult.data.id;
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Create a document" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);
      await waitForConversationProcessing(backend, startResult.data.id);

      // Exercise
      const result = await backend.assistants.retryLastResponse(
        startResult.data.id,
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CannotRetryLastResponse",
          details: {
            conversationId: startResult.data.id,
            reason: "ResponseHadSideEffects",
          },
        },
      });
    });

    it("error: CannotRetryLastResponse (reason: ConversationHasOutdatedContext)", async () => {
      // Setup SUT
      const { backend } = deps();
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);
      await waitForConversationProcessing(backend, startResult.data.id);
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "new-collection",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: { dataType: DataType.Struct, properties: {} },
          },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const result = await backend.assistants.retryLastResponse(
        startResult.data.id,
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CannotRetryLastResponse",
          details: {
            conversationId: startResult.data.id,
            reason: "ConversationHasOutdatedContext",
          },
        },
      });
    });

    it("success: retries last response", async () => {
      // Setup SUT
      const { backend } = deps();
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);
      await waitForConversationProcessing(backend, startResult.data.id);

      // Exercise
      const result = await backend.assistants.retryLastResponse(
        startResult.data.id,
        validInferenceOptions,
      );

      // Verify
      assert.isTrue(result.success);
      expect(result.data).toEqual(
        expect.objectContaining({
          id: startResult.data.id,
          status: ConversationStatus.Processing,
        }),
      );
    });
  });

  describe("recoverConversation", () => {
    it("error: InferenceOptionsNotValid", async () => {
      // Setup SUT
      const { backend } = deps({ inferenceSettings });

      // Exercise
      const result = await backend.assistants.recoverConversation(
        Id.generate.conversation(),
        invalidInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "InferenceOptionsNotValid",
          details: { issues: expect.any(Array) },
        },
      });
    });

    it("error: ConversationNotFound", async () => {
      // Setup SUT
      const { backend } = deps();
      const conversationId = Id.generate.conversation();

      // Exercise
      const result = await backend.assistants.recoverConversation(
        conversationId,
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConversationNotFound",
          details: { conversationId },
        },
      });
    });

    it("error: CannotRecoverConversation (reason: ConversationIsIdle)", async () => {
      // Setup SUT
      const { backend } = deps();
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);
      await waitForConversationProcessing(backend, startResult.data.id);

      // Exercise
      const result = await backend.assistants.recoverConversation(
        startResult.data.id,
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CannotRecoverConversation",
          details: {
            conversationId: startResult.data.id,
            reason: "ConversationIsIdle",
          },
        },
      });
    });

    it("error: CannotRecoverConversation (reason: ConversationIsProcessing)", async () => {
      // Setup SUT
      const neverResolvingInferenceService: InferenceService = {
        generateNextMessage: () => new Promise(() => {}),
        stt: () => new Promise(() => {}),
        inspectFile: () => new Promise(() => {}),
      };
      const { backend } = deps({
        inferenceService: neverResolvingInferenceService,
      });
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);

      // Exercise
      const result = await backend.assistants.recoverConversation(
        startResult.data.id,
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CannotRecoverConversation",
          details: {
            conversationId: startResult.data.id,
            reason: "ConversationIsProcessing",
          },
        },
      });
    });

    it("error: CannotRecoverConversation (reason: ConversationHasOutdatedContext)", async () => {
      // Setup SUT
      const throwingInferenceService: InferenceService = {
        generateNextMessage: async () => {
          throw new Error("Test error");
        },
        stt: async () => {
          throw new Error("Test error");
        },
        inspectFile: async () => {
          throw new Error("Test error");
        },
      };
      const { backend } = deps({ inferenceService: throwingInferenceService });
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);
      await waitForConversationProcessing(backend, startResult.data.id);
      const createCollectionResult = await backend.collections.create({
        settings: {
          name: "new-collection",
          icon: null,
          collectionCategoryId: null,
          defaultCollectionViewAppId: null,
          description: null,
          assistantInstructions: null,
        },
        schema: {
          types: {
            Root: { dataType: DataType.Struct, properties: {} },
          },
          rootType: "Root",
        },
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter: {
            source: "",
            compiled:
              "export default function getContentSummary() { return {}; }",
          },
          defaultDocumentViewUiOptions: null,
        },
      });
      assert.isTrue(createCollectionResult.success);

      // Exercise
      const result = await backend.assistants.recoverConversation(
        startResult.data.id,
        validInferenceOptions,
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CannotRecoverConversation",
          details: {
            conversationId: startResult.data.id,
            reason: "ConversationHasOutdatedContext",
          },
        },
      });
    });

    it("success: recovers conversation from Error state", async () => {
      // Setup SUT
      const throwingInferenceService: InferenceService = {
        generateNextMessage: async () => {
          throw new Error("Test error");
        },
        stt: async () => {
          throw new Error("Test error");
        },
        inspectFile: async () => {
          throw new Error("Test error");
        },
      };
      const { backend } = deps({ inferenceService: throwingInferenceService });
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);
      await waitForConversationProcessing(backend, startResult.data.id);

      // Exercise
      const result = await backend.assistants.recoverConversation(
        startResult.data.id,
        validInferenceOptions,
      );

      // Verify
      assert.isTrue(result.success);
      expect(result.data).toEqual(
        expect.objectContaining({
          id: startResult.data.id,
          status: ConversationStatus.Processing,
        }),
      );
    });
  });

  describe("deleteConversation", () => {
    it("error: CommandConfirmationNotValid", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.assistants.deleteConversation(
        Id.generate.conversation(),
        "not-delete",
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "CommandConfirmationNotValid",
          details: {
            suppliedCommandConfirmation: "not-delete",
            requiredCommandConfirmation: "delete",
          },
        },
      });
    });

    it("error: ConversationNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const conversationId = Id.generate.conversation();
      const result = await backend.assistants.deleteConversation(
        conversationId,
        "delete",
      );

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConversationNotFound",
          details: { conversationId },
        },
      });
    });

    it("success: deletes conversation", async () => {
      // Setup SUT
      const { backend } = deps();
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);
      await waitForConversationProcessing(backend, startResult.data.id);

      // Exercise
      const result = await backend.assistants.deleteConversation(
        startResult.data.id,
        "delete",
      );

      // Verify
      expect(result).toEqual({
        success: true,
        data: null,
        error: null,
      });
    });
  });

  describe("getConversation", () => {
    it("error: ConversationNotFound", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const conversationId = Id.generate.conversation();
      const result = await backend.assistants.getConversation(conversationId);

      // Verify
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ConversationNotFound",
          details: { conversationId },
        },
      });
    });

    it("success: gets conversation", async () => {
      // Setup SUT
      const { backend } = deps();
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);
      await waitForConversationProcessing(backend, startResult.data.id);

      // Exercise
      const result = await backend.assistants.getConversation(
        startResult.data.id,
      );

      // Verify
      assert.isTrue(result.success);
      expect(result.data).toEqual(
        expect.objectContaining({
          id: startResult.data.id,
          assistant: AssistantName.Factotum,
          status: ConversationStatus.Idle,
        }),
      );
      expect(result.data.messages.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("listConversations", () => {
    it("success: returns empty list", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.assistants.listConversations();

      // Verify
      expect(result).toEqual({
        success: true,
        data: [],
        error: null,
      });
    });

    it("success: returns conversations", async () => {
      // Setup SUT
      const { backend } = deps();
      const startResult = await backend.assistants.startConversation(
        AssistantName.Factotum,
        [{ type: MessageContentPartType.Text, text: "Hello" }],
        validInferenceOptions,
      );
      assert.isTrue(startResult.success);
      await waitForConversationProcessing(backend, startResult.data.id);

      // Exercise
      const result = await backend.assistants.listConversations();

      // Verify
      assert.isTrue(result.success);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          id: startResult.data.id,
          assistant: AssistantName.Factotum,
        }),
      );
    });
  });

  describe("getDeveloperPrompts", () => {
    it("success: returns developer prompts", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const result = await backend.assistants.getDeveloperPrompts();

      // Verify
      assert.isTrue(result.success);
      expect(result.data).toEqual({
        [AssistantName.Factotum]: expect.any(String),
        [AssistantName.CollectionCreator]: expect.any(String),
      });
    });
  });

  describe("searchConversations", () => {
    it("success: returns empty array when no matches", async () => {
      // Setup SUT
      const { backend } = deps();

      // Exercise
      const searchResult = await backend.assistants.searchConversations(
        "nonexistent",
        { limit: 20 },
      );

      // Verify
      expect(searchResult).toEqual({
        success: true,
        data: [],
        error: null,
      });
    });

    it("success: searches conversations by user message content", async () => {
      // Setup SUT
      const { backend } = deps();
      const startConversationResult =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          [
            {
              type: MessageContentPartType.Text,
              text: "uniquekeyword alpha",
            },
          ],
          validInferenceOptions,
        );
      assert.isTrue(startConversationResult.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult.data.id,
      );

      // Exercise
      const searchResult = await backend.assistants.searchConversations(
        "uniquekeyword",
        { limit: 20 },
      );

      // Verify
      assert.isTrue(searchResult.success);
      expect(searchResult.data).toHaveLength(1);
      expect(searchResult.data[0]).toEqual({
        match: expect.objectContaining({
          id: startConversationResult.data.id,
        }),
        matchedText: expect.any(String),
      });
    });

    it("success: returns multiple matching conversations", async () => {
      // Setup SUT
      const { backend } = deps();
      const startConversationResult1 =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          [{ type: MessageContentPartType.Text, text: "commonterm first" }],
          validInferenceOptions,
        );
      assert.isTrue(startConversationResult1.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult1.data.id,
      );
      const startConversationResult2 =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          [{ type: MessageContentPartType.Text, text: "commonterm second" }],
          validInferenceOptions,
        );
      assert.isTrue(startConversationResult2.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult2.data.id,
      );

      // Exercise
      const searchResult = await backend.assistants.searchConversations(
        "commonterm",
        { limit: 20 },
      );

      // Verify
      assert.isTrue(searchResult.success);
      expect(searchResult.data).toHaveLength(2);
      const resultIds = searchResult.data.map((result) => result.match.id);
      expect(resultIds).toContain(startConversationResult1.data.id);
      expect(resultIds).toContain(startConversationResult2.data.id);
    });

    it("success: does not return non-matching conversations", async () => {
      // Setup SUT
      const { backend } = deps();
      const startConversationResult1 =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          [{ type: MessageContentPartType.Text, text: "matchingterm here" }],
          validInferenceOptions,
        );
      assert.isTrue(startConversationResult1.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult1.data.id,
      );
      const startConversationResult2 =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          [{ type: MessageContentPartType.Text, text: "different content" }],
          validInferenceOptions,
        );
      assert.isTrue(startConversationResult2.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult2.data.id,
      );

      // Exercise
      const searchResult = await backend.assistants.searchConversations(
        "matchingterm",
        { limit: 20 },
      );

      // Verify
      assert.isTrue(searchResult.success);
      expect(searchResult.data).toHaveLength(1);
      expect(searchResult.data[0]!.match.id).toEqual(
        startConversationResult1.data.id,
      );
    });

    it("success: respects limit parameter", async () => {
      // Setup SUT
      const { backend } = deps();
      const startConversationResult1 =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          [{ type: MessageContentPartType.Text, text: "limitterm one" }],
          validInferenceOptions,
        );
      assert.isTrue(startConversationResult1.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult1.data.id,
      );
      const startConversationResult2 =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          [{ type: MessageContentPartType.Text, text: "limitterm two" }],
          validInferenceOptions,
        );
      assert.isTrue(startConversationResult2.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult2.data.id,
      );
      const startConversationResult3 =
        await backend.assistants.startConversation(
          AssistantName.Factotum,
          [{ type: MessageContentPartType.Text, text: "limitterm three" }],
          validInferenceOptions,
        );
      assert.isTrue(startConversationResult3.success);
      await waitForConversationProcessing(
        backend,
        startConversationResult3.data.id,
      );

      // Exercise
      const searchResult = await backend.assistants.searchConversations(
        "limitterm",
        { limit: 2 },
      );

      // Verify
      assert.isTrue(searchResult.success);
      expect(searchResult.data).toHaveLength(2);
    });
  });
});
