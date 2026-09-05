import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type App, AppType } from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CliBackend } from "../common/commandUtils.js";
import { compileApp } from "../common/compile.js";
import getAppChanges from "./getAppChanges.js";

vi.mock("../common/compile.js", () => ({ compileApp: vi.fn() }));

describe("getAppChanges", () => {
  let path: string;
  beforeEach(() => {
    path = mkdtempSync(join(tmpdir(), "superego-app-changes-"));
    vi.clearAllMocks();
  });
  afterEach(() => {
    rmSync(path, { recursive: true, force: true });
  });

  it.each([undefined, "", "# New intent"])(
    "detects spec changes without compiling unchanged source: %s",
    async (spec) => {
      // Setup SUT
      const app: App = {
        id: Id.generate.app(),
        type: AppType.CollectionView,
        name: "App",
        createdAt: new Date(),
        latestVersion: {
          id: Id.generate.appVersion(),
          createdAt: new Date(),
          targetCollections: [],
          spec: "# Existing intent",
          files: {
            "/main.tsx": {
              source: "export default 1;",
              compiled: "export default 1;",
            },
          },
        },
      };
      writeFileSync(
        join(path, "main.tsx"),
        app.latestVersion.files["/main.tsx"].source,
      );
      if (spec !== undefined) {
        writeFileSync(join(path, "spec.md"), spec);
      }

      // Exercise
      const changes = await getAppChanges({
        backend: {} as CliBackend,
        path,
        app,
        manifest: { name: app.name, type: app.type, targetCollectionIds: [] },
      });

      // Verify
      expect(changes).toEqual({
        spec: spec ?? app.latestVersion.spec,
        specChanged: spec !== undefined,
        sourceChanged: false,
        targetCollectionsChanged: false,
        mainModule: null,
      });
      expect(compileApp).not.toHaveBeenCalled();
    },
  );
});
