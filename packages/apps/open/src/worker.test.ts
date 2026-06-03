import { describe, expect, it } from "vitest";
import { handleRequest } from "./worker.js";

describe("handleRequest", () => {
  it("redirects route paths to Superego deep links", () => {
    // Exercise
    const response = handleRequest(
      new Request(
        "https://open.superego.dev/collections/Collection_abc?view=App&appId=App_abc",
      ),
    );

    // Verify
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "superego:///collections/Collection_abc?view=App&appId=App_abc",
    );
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("renders the privacy note at the root", async () => {
    // Exercise
    const response = handleRequest(new Request("https://open.superego.dev/"));

    // Verify
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/html; charset=utf-8",
    );
    await expect(response.text()).resolves.toContain(
      "Superego does not store, analyze, or log these IDs",
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
