import { describe, expect, it, vi } from "vitest";
import dispatchOperation, { type HostBackend } from "./dispatchOperation.js";

describe("app bridge dispatch", () => {
  it.each([
    ["apps", "createNewVersion"],
    ["state", "constructor"],
    ["__proto__", "toString"],
    ["http", "request"],
  ])("rejects %s.%s", async (entity, method) => {
    // Setup SUT
    const backend = {} as HostBackend;
    // Exercise
    const result = await dispatchOperation(backend, entity!, method!, []);
    // Verify
    expect(result).toEqual({
      success: false,
      data: null,
      error: {
        name: "ArgumentsNotValid",
        details: {
          issues: [{ message: expect.any(String) }],
        },
      },
    });
  });
  it("rejects identity claims and malformed state arguments", async () => {
    // Setup mocks
    const get = vi.fn();
    const update = vi.fn();
    const backend = { state: { get, update } } as unknown as HostBackend;
    // Exercise
    const results = await Promise.all([
      dispatchOperation(backend, "state", "get", ["App_someone_else"]),
      dispatchOperation(backend, "state", "update", ["1", {}]),
    ]);
    // Verify
    for (const result of results) {
      expect(result).toEqual({
        success: false,
        data: null,
        error: {
          name: "ArgumentsNotValid",
          details: {
            issues: [{ message: expect.any(String) }],
          },
        },
      });
    }
    expect(get).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects arguments that cannot be passed to the backend", async () => {
    // Setup mocks
    const create = vi.fn();
    const backend = { documents: { create } } as unknown as HostBackend;
    // Exercise
    const result = await dispatchOperation(backend, "documents", "create", [
      { content: { value: Number.NaN } },
    ]);
    // Verify
    expect(result).toEqual({
      success: false,
      data: null,
      error: {
        name: "ArgumentsNotValid",
        details: {
          issues: [{ message: expect.any(String) }],
        },
      },
    });
    expect(create).not.toHaveBeenCalled();
  });
});
