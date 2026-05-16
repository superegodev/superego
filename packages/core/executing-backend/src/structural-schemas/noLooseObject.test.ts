import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function listTypescriptFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((dirent) => {
    const path = join(directory, dirent.name);
    if (dirent.isDirectory()) {
      return listTypescriptFiles(path);
    }
    return extname(path) === ".ts" && !path.endsWith(".test.ts") ? [path] : [];
  });
}

describe("structural schemas", () => {
  it("do not use loose object validation", () => {
    // Setup SUT
    const sourceRoot = fileURLToPath(new URL("../", import.meta.url));
    const forbiddenCall = `loose${"Object"}`;

    // Exercise
    const matchingFiles = listTypescriptFiles(sourceRoot).filter((path) =>
      readFileSync(path, "utf8").includes(forbiddenCall),
    );

    // Verify
    expect(matchingFiles).toEqual([]);
  });
});
