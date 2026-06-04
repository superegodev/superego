import { describe, expect, it } from "vitest";
import { handleRequest } from "./worker.js";

describe("handleRequest", () => {
  it("does not redirect route paths to Superego deep links", () => {
    // Exercise
    const response = handleRequest(
      new Request(
        "https://open.superego.dev/collections/Collection_abc?view=App&appId=App_abc",
      ),
    );

    // Verify
    expect(response.status).toBe(404);
    expect(response.headers.get("Location")).toBeNull();
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("renders the fragment-based opener at the root", async () => {
    // Exercise
    const response = handleRequest(new Request("https://open.superego.dev/"));

    // Verify
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/html; charset=utf-8",
    );
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
    await expect(response.text()).resolves.toContain(
      "window.location.replace(deepLink)",
    );
  });

  it("rejects non-GET methods", () => {
    // Exercise
    const response = handleRequest(
      new Request("https://open.superego.dev/collections/Collection_abc", {
        method: "POST",
      }),
    );

    // Verify
    expect(response.status).toBe(405);
  });
});
