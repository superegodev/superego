import { describe, expect, it, vi } from "vitest";
import dispatchOperation, { type HostBackend } from "./dispatchOperation.js";

describe("app bridge dispatch", () => {
  it.each([
    ["apps", "createNewVersion"],
    ["state", "constructor"],
    ["__proto__", "toString"],
    ["http", "constructor"],
  ])("rejects %s.%s", async (entity, method) => {
    // Setup SUT
    const backend = {} as HostBackend;
    // Exercise
    const result = await dispatchOperation(backend, entity!, method!, []);
    // Verify
    expect(result.error?.name).toBe("AppBridgeError");
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
    expect(
      results.every((result) => result.error?.name === "AppBridgeError"),
    ).toBe(true);
    expect(get).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});
