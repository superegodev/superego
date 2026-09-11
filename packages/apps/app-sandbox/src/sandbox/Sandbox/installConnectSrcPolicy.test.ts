import { afterEach, describe, expect, it } from "vitest";
import installConnectSrcPolicy from "./installConnectSrcPolicy.js";

const frames: HTMLIFrameElement[] = [];
afterEach(() => {
  for (const frame of frames) {
    frame.remove();
  }
  frames.length = 0;
});

async function createFrame() {
  const frame = document.createElement("iframe");
  frame.srcdoc = "<!doctype html><html><head></head><body></body></html>";
  frames.push(frame);
  await new Promise<void>((resolve) => {
    frame.onload = () => resolve();
    document.body.append(frame);
  });
  return { document: frame.contentDocument!, window: frame.contentWindow! };
}

function nextViolation(document: Document) {
  return new Promise<SecurityPolicyViolationEvent>((resolve) => {
    document.addEventListener("securitypolicyviolation", resolve, {
      once: true,
    });
  });
}

describe("installConnectSrcPolicy", () => {
  it("deduplicates destinations and preserves sandbox resources", async () => {
    // Setup SUT
    const frame = await createFrame();
    // Exercise
    installConnectSrcPolicy(frame.document, [
      "https://example.com",
      "https://example.com",
      "http://localhost:8080",
    ]);
    const response = await frame.window.fetch("data:text/plain,local-resource");
    // Verify
    expect(frame.document.querySelector("meta")?.content).toBe(
      "connect-src 'self' data: blob: https://tiles.openfreemap.org https://example.com http://localhost:8080",
    );
    expect(await response.text()).toBe("local-resource");
  });

  it("keeps a processed policy after removal and ignores later configuration", async () => {
    // Setup SUT
    const frame = await createFrame();
    installConnectSrcPolicy(frame.document, []);
    const policy = frame.document.querySelector("meta")!;
    // Exercise
    policy.content = "connect-src *";
    policy.remove();
    installConnectSrcPolicy(frame.document, ["https://denied.example"]);
    const violation = nextViolation(frame.document);
    const request = frame.window.fetch("https://denied.example/private");
    // Verify
    await expect(request).rejects.toThrow();
    expect(await violation).toMatchObject({
      effectiveDirective: "connect-src",
      blockedURI: "https://denied.example/private",
    });
    expect(frame.document.querySelector("meta")).toBeNull();
  });

  it("gives separate documents independent policies", async () => {
    // Setup SUT
    const first = await createFrame();
    const second = await createFrame();
    // Exercise
    installConnectSrcPolicy(first.document, ["https://first.example"]);
    installConnectSrcPolicy(second.document, ["https://second.example"]);
    const violation = nextViolation(second.document);
    const request = second.window.fetch("https://first.example/private");
    // Verify
    await expect(request).rejects.toThrow();
    expect(await violation).toMatchObject({
      effectiveDirective: "connect-src",
    });
    expect(first.document.querySelector("meta")?.content).toContain(
      "https://first.example",
    );
    expect(second.document.querySelector("meta")?.content).not.toContain(
      "https://first.example",
    );
  });
});
