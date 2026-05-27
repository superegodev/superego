import type { ExecutingTypescriptFunctionFailed } from "@superego/backend";
import type { Result } from "@superego/global-types";
import { Id } from "@superego/shared-utils";
import { expect, it, vi } from "vitest";
import type TypescriptSandbox from "../requirements/TypescriptSandbox.js";
import makeContentSummary from "./makeContentSummary.js";

it("ExecutingTypescriptFunctionFailed result on getter execution failed", async () => {
  // Setup mocks
  const mockFailedExecutionResult: Result<
    null,
    TypescriptSandbox.ExecutingFunctionFailed
  > = {
    success: false,
    data: null,
    error: {
      name: "ExecutingFunctionFailed",
      details: { message: "message" },
    },
  };
  const expectedFailedExecutionResult: Result<
    null,
    ExecutingTypescriptFunctionFailed
  > = {
    success: false,
    data: null,
    error: {
      name: "ExecutingTypescriptFunctionFailed",
      details: { message: "message" },
    },
  };
  const mockTypescriptSandbox = {
    executeSyncFunction: vi.fn().mockResolvedValue(mockFailedExecutionResult),
  };

  // Setup SUT
  const collectionVersion = {
    id: Id.generate.collectionVersion(),
    collectionId: Id.generate.collection(),
    settings: {
      contentSummaryGetter:
        "export default function getContentSummary() { return {}; }",
    },
  };
  const documentVersionInfo = {
    id: Id.generate.documentVersion(),
    documentId: Id.generate.document(),
    content: {},
  };

  // Exercise
  const result = await makeContentSummary(
    mockTypescriptSandbox as any,
    collectionVersion as any,
    documentVersionInfo as any,
  );

  // Verify
  expect(result).toEqual(expectedFailedExecutionResult);
});

it("ContentSummaryNotValid result on non-valid content summary", async () => {
  // Setup mocks
  const mockInvalidContentSummary = { object: {} };
  const mockSuccessfulExecutionResult: Result<any, never> = {
    success: true,
    data: mockInvalidContentSummary,
    error: null,
  };
  const mockTypescriptSandbox = {
    executeSyncFunction: vi
      .fn()
      .mockResolvedValue(mockSuccessfulExecutionResult),
  };

  // Setup SUT
  const collectionVersion = {
    id: Id.generate.collectionVersion(),
    collectionId: Id.generate.collection(),
    settings: {
      contentSummaryGetter:
        "export default function getContentSummary() { return {}; }",
    },
  };
  const documentVersionInfo = {
    id: Id.generate.documentVersion(),
    documentId: Id.generate.document(),
    content: {},
  };

  // Exercise
  const result = await makeContentSummary(
    mockTypescriptSandbox as any,
    collectionVersion as any,
    documentVersionInfo as any,
  );

  // Verify
  expect(result).toEqual({
    success: false,
    data: null,
    error: {
      details: {
        collectionId: collectionVersion.collectionId,
        collectionVersionId: collectionVersion.id,
        documentId: documentVersionInfo.documentId,
        documentVersionId: documentVersionInfo.id,
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
  const mockTypescriptSandbox = {
    executeSyncFunction: vi
      .fn()
      .mockResolvedValue(mockSuccessfulExecutionResult),
  };

  // Setup SUT
  const collectionVersion = {
    id: Id.generate.collectionVersion(),
    collectionId: Id.generate.collection(),
    settings: {
      contentSummaryGetter:
        "export default function getContentSummary() { return {}; }",
    },
  };
  const documentVersionInfo = {
    id: Id.generate.documentVersion(),
    documentId: Id.generate.document(),
    content: {},
  };

  // Exercise
  const result = await makeContentSummary(
    mockTypescriptSandbox as any,
    collectionVersion as any,
    documentVersionInfo as any,
  );

  // Verify
  expect(result).toEqual({
    success: true,
    data: mockValidContentSummary,
    error: null,
  });
});
