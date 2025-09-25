import type { ExecutingJavascriptFunctionFailed } from "@superego/backend";
import type { Result } from "@superego/global-types";
import { Id } from "@superego/shared-utils";
import { expect, it, vi } from "vitest";
import makeContentSummaries from "./makeContentSummaries.js";

it("ExecutingJavascriptFunctionFailed result for all document versions on getter execution failed", async () => {
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
  const documentVersions = [
    {
      id: Id.generate.documentVersion(),
      documentId: Id.generate.document(),
      content: {},
    },
    {
      id: Id.generate.documentVersion(),
      documentId: Id.generate.document(),
      content: {},
    },
  ];

  // Exercise
  const result = await makeContentSummaries(
    mockJavascriptSandbox as any,
    collectionVersion as any,
    documentVersions as any,
  );

  // Verify
  expect(result).toEqual([
    mockFailedExecutionResult,
    mockFailedExecutionResult,
  ]);
});

it("ContentSummaryNotValid result for non-valid content summaries, successful result for valid content summaries", async () => {
  // Setup mocks
  const mockJavascriptSandbox = {
    executeSyncFunction: (_: any, [contents]: any[]) => ({
      success: true,
      data: contents,
      error: null,
    }),
  };

  // Setup SUT
  const collectionVersion = {
    id: Id.generate.collectionVersion(),
    collectionId: Id.generate.collection(),
    settings: {
      contentSummaryGetter: { source: "", compiled: "" },
    },
  };
  const documentVersions = [
    {
      id: Id.generate.documentVersion(),
      documentId: Id.generate.document(),
      content: {
        object: {},
      },
    },
    {
      id: Id.generate.documentVersion(),
      documentId: Id.generate.document(),
      content: {
        string: "string",
        number: 0,
        boolean: true,
        null: null,
      },
    },
  ] as const;

  // Exercise
  const result = await makeContentSummaries(
    mockJavascriptSandbox as any,
    collectionVersion as any,
    documentVersions as any,
  );

  // Verify
  expect(result).toEqual([
    {
      success: false,
      data: null,
      error: {
        details: {
          collectionId: collectionVersion.collectionId,
          collectionVersionId: collectionVersion.id,
          documentId: documentVersions[0].documentId,
          documentVersionId: documentVersions[0].id,
          issues: [
            {
              message:
                "Invalid type: Expected (string | number | boolean | null) but received Object",
              path: [{ key: "object" }],
            },
          ],
        },
        name: "ContentSummaryNotValid",
      },
    },
    {
      success: true,
      data: {
        string: "string",
        number: 0,
        boolean: true,
        null: null,
      },
      error: null,
    },
  ]);
});
