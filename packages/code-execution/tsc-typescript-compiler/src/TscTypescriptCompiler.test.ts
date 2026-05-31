import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { registerTypescriptCompilerTests } from "@superego/executing-backend/tests";
import * as tsvfs from "@typescript/vfs";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";
import TscTypescriptCompiler from "./TscTypescriptCompiler.js";

registerTypescriptCompilerTests(() => {
  const typescriptCompiler = new TscTypescriptCompiler();
  return { typescriptCompiler };
});

describe("compile in packaged Electron", () => {
  it("passes the packaged TypeScript lib directory to the VFS", async () => {
    // Setup
    const resourcesPath = mkdtempSync(join(tmpdir(), "superego-resources-"));
    const packagedTypescriptDirectory = join(
      resourcesPath,
      "app.asar/node_modules/typescript",
    );
    const typescriptLibDirectory = join(
      packagedTypescriptDirectory,
      "lib",
    );
    const realTypescriptLibDirectory = dirname(
      createRequire(import.meta.url).resolve("typescript"),
    );
    mkdirSync(packagedTypescriptDirectory, { recursive: true });
    symlinkSync(realTypescriptLibDirectory, typescriptLibDirectory, "dir");
    const createDefaultMapFromNodeModulesSpy = vi.spyOn(
      tsvfs,
      "createDefaultMapFromNodeModules",
    );
    const processResourcesPathDescriptor = Object.getOwnPropertyDescriptor(
      process,
      "resourcesPath",
    );
    Object.defineProperty(process, "resourcesPath", {
      configurable: true,
      value: resourcesPath,
    });

    try {
      const typescriptCompiler = new TscTypescriptCompiler();

      // Exercise
      const result = await typescriptCompiler.compile(
        { path: "/main.ts", source: "export default 1;" },
        [],
      );

      // Verify
      expect(result.success).toBe(true);
      expect(createDefaultMapFromNodeModulesSpy).toHaveBeenCalledWith(
        { target: ts.ScriptTarget.ESNext },
        ts,
        typescriptLibDirectory,
      );
    } finally {
      createDefaultMapFromNodeModulesSpy.mockRestore();
      if (processResourcesPathDescriptor) {
        Object.defineProperty(
          process,
          "resourcesPath",
          processResourcesPathDescriptor,
        );
      } else {
        delete (process as typeof process & { resourcesPath?: string })
          .resourcesPath;
      }
      rmSync(resourcesPath, { recursive: true, force: true });
    }
  });
});
