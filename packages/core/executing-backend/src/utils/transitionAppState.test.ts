import type { AppState, AppStateDefinition } from "@superego/backend";
import { DataType } from "@superego/schema";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import { expect, it, vi } from "vitest";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";
import transitionAppState from "./transitionAppState.js";

const definition: AppStateDefinition = {
  schema: {
    types: {
      State: {
        dataType: DataType.Struct,
        properties: { count: { dataType: DataType.Number } },
      },
    },
    rootType: "State",
  },
  initialState: { count: 0 },
  migration: { source: "", compiled: "export default (state) => state;" },
};
const current: AppState = {
  content: { count: 5 },
  revision: 2,
  schemaId: "AppVersion_previous",
};

it("preserves execution diagnostics as a migration failure cause", async () => {
  // Setup mocks
  const executionDetails = {
    message: "migration failed",
    name: "TypeError",
    stack: "migration stack",
  };
  const javascriptSandbox: JavascriptSandbox = {
    moduleDefaultExportsFunction: vi.fn().mockResolvedValue(true),
    executeSyncFunction: vi.fn().mockResolvedValue(
      makeUnsuccessfulResult({
        name: "ExecutingFunctionFailed",
        details: executionDetails,
      }),
    ),
  };

  // Exercise
  const result = await transitionAppState(
    "App_existing",
    definition,
    definition,
    current,
    "AppVersion_next",
    javascriptSandbox,
  );

  // Verify
  expect(result.error).toEqual({
    name: "AppStateMigrationFailed",
    details: {
      appId: "App_existing",
      cause: {
        name: "ExecutingTypescriptFunctionFailed",
        details: executionDetails,
      },
    },
  });
  expect(current.content).toEqual({ count: 5 });
});

it.each(["moduleDefaultExportsFunction", "executeSyncFunction"] as const)(
  "preserves unexpected exceptions from %s",
  async (method) => {
    // Setup mocks
    const javascriptSandbox: JavascriptSandbox = {
      moduleDefaultExportsFunction: vi.fn().mockResolvedValue(true),
      executeSyncFunction: vi
        .fn()
        .mockResolvedValue(makeSuccessfulResult({ count: 6 })),
    };
    vi.mocked(javascriptSandbox[method]).mockRejectedValue(
      new Error("sandbox failure"),
    );

    // Exercise
    const result = await transitionAppState(
      "App_existing",
      definition,
      definition,
      current,
      "AppVersion_next",
      javascriptSandbox,
    );

    // Verify
    expect(result.error).toEqual({
      name: "AppStateMigrationFailed",
      details: {
        appId: "App_existing",
        cause: {
          name: "UnexpectedError",
          details: {
            cause: expect.objectContaining({
              message: "sandbox failure",
              name: "Error",
            }),
          },
        },
      },
    });
  },
);

it("rejects non-JSON migration output with content validation diagnostics", async () => {
  // Setup mocks
  const javascriptSandbox: JavascriptSandbox = {
    moduleDefaultExportsFunction: vi.fn().mockResolvedValue(true),
    executeSyncFunction: vi
      .fn()
      .mockResolvedValue(makeSuccessfulResult({ count: Number.NaN })),
  };

  // Exercise
  const result = await transitionAppState(
    "App_existing",
    definition,
    definition,
    current,
    "AppVersion_next",
    javascriptSandbox,
  );

  // Verify
  expect(result.error).toEqual({
    name: "AppStateMigrationFailed",
    details: {
      appId: "App_existing",
      cause: {
        name: "AppStateContentNotValid",
        details: {
          appId: "App_existing",
          schemaId: "AppVersion_next",
          issues: [
            expect.objectContaining({
              message: "App state must be JSON-serializable.",
            }),
          ],
        },
      },
    },
  });
});

it("advances revision and schema identity after a valid migration", async () => {
  // Setup mocks
  const javascriptSandbox: JavascriptSandbox = {
    moduleDefaultExportsFunction: vi.fn().mockResolvedValue(true),
    executeSyncFunction: vi
      .fn()
      .mockResolvedValue(makeSuccessfulResult({ count: 6 })),
  };

  // Exercise
  const result = await transitionAppState(
    "App_existing",
    definition,
    definition,
    current,
    "AppVersion_next",
    javascriptSandbox,
  );

  // Verify
  expect(result).toEqual({
    success: true,
    data: { content: { count: 6 }, revision: 3, schemaId: "AppVersion_next" },
    error: null,
  });
  expect(javascriptSandbox.executeSyncFunction).toHaveBeenCalledWith(
    definition.migration,
    [current.content],
  );
});
