import { describe, expect, it, vi } from "vitest";
import { authorizeDestination, isPublicAddress } from "./destinationPolicy.js";

describe("HTTP destination policy", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "169.254.169.254",
    "100.64.0.1",
    "172.16.1.1",
    "192.168.1.1",
    "0.0.0.0",
    "224.0.0.1",
    "::1",
    "::ffff:127.0.0.1",
    "fc00::1",
    "fe80::1",
    "2002:7f00:1::",
    "2001:db8::1",
  ])("rejects hostname resolution to %s", (address) => {
    // Exercise
    const allowed = isPublicAddress(address);
    // Verify
    expect(allowed).toBe(false);
  });
  it.each(["1.1.1.1", "8.8.8.8", "2606:4700:4700::1111"])(
    "accepts public address %s",
    (address) => {
      // Exercise
      const allowed = isPublicAddress(address);
      // Verify
      expect(allowed).toBe(true);
    },
  );
  it("pins a public result and rejects a subsequent private DNS result", async () => {
    // Setup mocks
    const resolve = vi
      .fn()
      .mockResolvedValueOnce([{ address: "1.1.1.1", family: 4 }])
      .mockResolvedValueOnce([{ address: "127.0.0.1", family: 4 }]);
    // Exercise
    const first = await authorizeDestination(
      new URL("https://example.com"),
      ["https://example.com"],
      resolve,
    );
    const next = authorizeDestination(
      new URL("https://example.com"),
      ["https://example.com"],
      resolve,
    );
    // Verify
    expect(first).toEqual({ address: "1.1.1.1", family: 4 });
    await expect(next).rejects.toThrow();
  });
  it("requires exact origin and permits explicitly configured local IPs", async () => {
    // Setup mocks
    const resolve = vi.fn();
    // Exercise
    const local = await authorizeDestination(
      new URL("http://127.0.0.1:8080"),
      ["http://127.0.0.1:8080"],
      resolve,
    );
    // Verify
    expect(local.address).toBe("127.0.0.1");
    expect(resolve).not.toHaveBeenCalled();
    await expect(
      authorizeDestination(
        new URL("http://127.0.0.1:8081"),
        ["http://127.0.0.1:8080"],
        resolve,
      ),
    ).rejects.toThrow();
    await expect(
      authorizeDestination(
        new URL("https://sub.example.com"),
        ["https://example.com"],
        resolve,
      ),
    ).rejects.toThrow();
  });
});
