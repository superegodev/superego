import type { ExecutingJavascriptFunctionFailed } from "@superego/backend";
import type { Result } from "@superego/global-types";
import { Id } from "@superego/shared-utils";
import { expect, it, vi } from "vitest";
import makeContentSummary from "./makeContentSummary.js";

it("ExecutingJavascriptFunctionFailed result on getter execution failed", async () => {
  // Setup mocks
  const mockFailedExecutionResult: Result<
    null,
    ExecutingJavascriptFunctionFailed
  > = {
    success: false,
    data: null,
    error: {
      name: "ExecutingJavascriptFunctionFailed",
      details: { message: "message" },
    },
  };
  const mockJavascriptSandbox = {
    executeSyncFunction: vi.fn().mockResolvedValue(mockFailedExecutionResult),
  };

  // Setup SUT
  const collectionVersion = {
    id: Id.generate.collectionVersion(),
    collectionId: Id.generate.collection(),
    settings: {
      contentSummaryGetter: { source: "", compiled: "" },
    },
  };
  const documentVersion = {
    id: Id.generate.documentVersion(),
    documentId: Id.generate.document(),
    content: {},
  };

  // Exercise
  const result = await makeContentSummary(
    mockJavascriptSandbox as any,
    collectionVersion as any,
    documentVersion as any,
  );

  // Verify
  expect(result).toEqual(mockFailedExecutionResult);
});

it("ContentSummaryNotValid result on non-valid content summary", async () => {
  // Setup mocks
  const mockInvalidContentSummary = { object: {} };
  const mockSuccessfulExecutionResult: Result<any, never> = {
    success: true,
    data: mockInvalidContentSummary,
    error: null,
  };
  const mockJavascriptSandbox = {
    executeSyncFunction: vi
      .fn()
      .mockResolvedValue(mockSuccessfulExecutionResult),
  };

  // Setup SUT
  const collectionVersion = {
    id: Id.generate.collectionVersion(),
    collectionId: Id.generate.collection(),
    settings: {
      contentSummaryGetter: { source: "", compiled: "" },
    },
  };
  const documentVersion = {
    id: Id.generate.documentVersion(),
    documentId: Id.generate.document(),
    content: {},
  };

  // Exercise
  const result = await makeContentSummary(
    mockJavascriptSandbox as any,
    collectionVersion as any,
    documentVersion as any,
  );

  // Verify
  expect(result).toEqual({
    success: false,
    data: null,
    error: {
      details: {
        collectionId: collectionVersion.collectionId,
        collectionVersionId: collectionVersion.id,
        documentId: documentVersion.documentId,
        documentVersionId: documentVersion.id,
        issues: [
          {
            message:
              "Invalid type: Expected (string | number | NaN | boolean | null) but received Object",
            path: [{ key: "object" }],
          },
        ],
      },
      name: "ContentSummaryNotValid",
    },
  });
});

it("successful result on valid content summary", async () => {
  // Setup mocks
  const mockValidContentSummary = {
    string: "string",
    number: 0,
    boolean: true,
    null: null,
  };
  const mockSuccessfulExecutionResult: Result<any, never> = {
    success: true,
    data: mockValidContentSummary,
    error: null,
  };
  const mockJavascriptSandbox = {
    executeSyncFunction: vi
      .fn()
      .mockResolvedValue(mockSuccessfulExecutionResult),
  };

  // Setup SUT
  const collectionVersion = {
    id: Id.generate.collectionVersion(),
    collectionId: Id.generate.collection(),
    settings: {
      contentSummaryGetter: { source: "", compiled: "" },
    },
  };
  const documentVersion = {
    id: Id.generate.documentVersion(),
    documentId: Id.generate.document(),
    content: {},
  };

  // Exercise
  const result = await makeContentSummary(
    mockJavascriptSandbox as any,
    collectionVersion as any,
    documentVersion as any,
  );

  // Verify
  expect(result).toEqual({
    success: true,
    data: mockValidContentSummary,
    error: null,
  });
});
