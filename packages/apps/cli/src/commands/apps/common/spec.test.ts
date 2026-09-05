import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readSpec } from "./spec.js";

describe("readSpec", () => {
  let path: string;
  beforeEach(() => {
    path = mkdtempSync(join(tmpdir(), "superego-spec-"));
  });
  afterEach(() => {
    rmSync(path, { recursive: true, force: true });
  });

  it("defaults new projects to an empty specification", () => {
    // Exercise
    const spec = readSpec(path);
    // Verify
    expect(spec).toBe("");
  });
  it("preserves the stored specification for legacy checkouts", () => {
    // Exercise
    const spec = readSpec(path, "# Existing intent");
    // Verify
    expect(spec).toBe("# Existing intent");
  });
  it.each(["", "# Intent\n\n- Preserve **Markdown** and caffè.\n"])(
    "reads an explicit specification verbatim: %s",
    (content) => {
      // Setup SUT
      writeFileSync(join(path, "spec.md"), content);
      // Exercise
      const spec = readSpec(path, "# Existing intent");
      // Verify
      expect(spec).toBe(content);
    },
  );
  it("does not hide read errors as a missing specification", () => {
    // Setup SUT
    mkdirSync(join(path, "spec.md"));
    // Exercise
    const read = () => readSpec(path, "# Existing intent");
    // Verify
    expect(read).toThrow();
  });
});
