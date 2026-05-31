import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { registerTypescriptCompilerTests } from "@superego/executing-backend/tests";
import { afterEach, describe, expect, it } from "vitest";
import TscTypescriptCompiler, {
  getPackagedElectronTypescriptLibDirectory,
} from "./TscTypescriptCompiler.js";

registerTypescriptCompilerTests(() => {
  const typescriptCompiler = new TscTypescriptCompiler();
  return { typescriptCompiler };
});

describe("getPackagedElectronTypescriptLibDirectory", () => {
  const testDirectories: string[] = [];

  afterEach(() => {
    for (const testDirectory of testDirectories) {
      rmSync(testDirectory, { recursive: true, force: true });
    }
    testDirectories.length = 0;
  });

  it("returns undefined when resourcesPath is missing", () => {
    // Exercise
    const result = getPackagedElectronTypescriptLibDirectory(undefined);

    // Verify
    expect(result).toBeUndefined();
  });

  it("returns undefined when packaged TypeScript lib directory is missing", () => {
    // Setup
    const resourcesPath = mkdtempSync(
      join(tmpdir(), "superego-test-resources-missing-"),
    );
    testDirectories.push(resourcesPath);

    // Exercise
    const result = getPackagedElectronTypescriptLibDirectory(resourcesPath);

    // Verify
    expect(result).toBeUndefined();
  });

  it("returns packaged TypeScript lib directory when it exists", () => {
    // Setup
    const resourcesPath = mkdtempSync(
      join(tmpdir(), "superego-test-resources-existing-"),
    );
    const typescriptLibDirectory = join(
      resourcesPath,
      "app.asar",
      "node_modules",
      "typescript",
      "lib",
    );
    testDirectories.push(resourcesPath);
    mkdirSync(typescriptLibDirectory, { recursive: true });

    // Exercise
    const result = getPackagedElectronTypescriptLibDirectory(resourcesPath);

    // Verify
    expect(result).toBe(typescriptLibDirectory);
  });
});
