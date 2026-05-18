import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { AppVersionFiles } from "@superego/backend";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_SUPEREGOIGNORE,
  installBundledDependencies,
  readProjectFiles,
  scanProjectFiles,
  validateStaticAssets,
} from "./index.js";

let projectPath: string;

beforeEach(() => {
  projectPath = mkdtempSync(join(tmpdir(), "superego-cli-tests-"));
});

afterEach(() => {
  rmSync(projectPath, { recursive: true, force: true });
});

describe("app project file scanning", () => {
  it("default .superegoignore ignores common local files", () => {
    // Setup SUT
    writeProjectFile(".superegoignore", DEFAULT_SUPEREGOIGNORE);
    writeProjectFile("src/main.js", "console.log('hello');");
    writeProjectFile("dist/index.html", "<!doctype html>");
    writeProjectFile("node_modules/package/index.js", "");
    writeProjectFile(".git/config", "");
    writeProjectFile(".env.local", "SECRET=value");
    writeProjectFile("debug.log", "");
    writeProjectFile("coverage/index.html", "");
    writeProjectFile(".cache/data", "");
    writeProjectFile(".DS_Store", "");

    // Exercise
    const result = scanProjectFiles(projectPath);

    // Verify
    expect(result.errors).toEqual([]);
    expect(result.paths).toEqual([
      "/.superegoignore",
      "/dist/index.html",
      "/src/main.js",
    ]);
  });

  it("explicit un-ignore includes normally ignored user-owned files", () => {
    // Setup SUT
    writeProjectFile(
      ".superegoignore",
      `
node_modules/
.env*
!node_modules/kept.txt
!.env.local
`.trimStart(),
    );
    writeProjectFile("src/main.js", "console.log('hello');");
    writeProjectFile("dist/index.html", "<!doctype html>");
    writeProjectFile("node_modules/ignored.txt", "");
    writeProjectFile("node_modules/kept.txt", "");
    writeProjectFile(".env.local", "SECRET=value");

    // Exercise
    const result = scanProjectFiles(projectPath);

    // Verify
    expect(result.errors).toEqual([]);
    expect(result.paths).toEqual([
      "/.env.local",
      "/.superegoignore",
      "/dist/index.html",
      "/node_modules/kept.txt",
      "/src/main.js",
    ]);
    expect(result.warnings).toEqual([
      "Including risky project file in the app snapshot: /.env.local",
      "Including risky project file in the app snapshot: /node_modules/kept.txt",
    ]);
  });

  it("reserved checkout files are excluded even if unignored", () => {
    // Setup SUT
    writeProjectFile(
      ".superegoignore",
      `
!superego/app.ts
!superego.app.json
`.trimStart(),
    );
    writeProjectFile("src/main.js", "console.log('hello');");
    writeProjectFile("dist/index.html", "<!doctype html>");
    writeProjectFile("superego/app.ts", "");
    writeProjectFile("superego.app.json", "{}");

    // Exercise
    const result = scanProjectFiles(projectPath);

    // Verify
    expect(result.errors).toEqual([]);
    expect(result.paths).toEqual([
      "/.superegoignore",
      "/dist/index.html",
      "/src/main.js",
    ]);
  });

  it("classifies build, project config, and source roles", () => {
    // Setup SUT
    writeProjectFile(".superegoignore", DEFAULT_SUPEREGOIGNORE);
    writeProjectFile("package.json", "{}");
    writeProjectFile("vite.config.ts", "export default {};");
    writeProjectFile("src/main.js", "console.log('hello');");
    writeProjectFile("dist/index.html", "<!doctype html>");

    // Exercise
    const files = readProjectFiles(projectPath);

    // Verify
    expect(files["/dist/index.html"]!.role).toBe("build");
    expect(files["/.superegoignore"]!.role).toBe("projectConfig");
    expect(files["/package.json"]!.role).toBe("projectConfig");
    expect(files["/vite.config.ts"]!.role).toBe("projectConfig");
    expect(files["/src/main.js"]!.role).toBe("source");
  });

  it("reports size limit errors", () => {
    // Setup SUT
    writeProjectFile(".superegoignore", DEFAULT_SUPEREGOIGNORE);
    writeProjectFile("src/main.js", "console.log('hello');");
    writeProjectFile("dist/index.html", "<!doctype html>");
    writeProjectFile(
      "src/huge.bin",
      Buffer.alloc(AppVersionFiles.APP_VERSION_FILE_SIZE_LIMIT_BYTES + 1),
    );

    // Exercise
    const result = scanProjectFiles(projectPath);

    // Verify
    expect(result.errors).toEqual([
      `Project file exceeds ${AppVersionFiles.APP_VERSION_FILE_SIZE_LIMIT_BYTES} bytes: /src/huge.bin`,
    ]);
  });
});

describe("static asset validation", () => {
  it("accepts valid relative HTML and CSS asset references", () => {
    // Setup SUT
    writeProjectFile(".superegoignore", DEFAULT_SUPEREGOIGNORE);
    writeProjectFile(
      "dist/index.html",
      `
<!doctype html>
<script type="module" src="./main.js?v=1#hash"></script>
<link rel="stylesheet" href="./style.css">
<img src="./assets/logo.png">
`.trimStart(),
    );
    writeProjectFile("dist/main.js", "");
    writeProjectFile(
      "dist/style.css",
      "body { background: url('./assets/bg.png'); }",
    );
    writeProjectFile("dist/assets/logo.png", new Uint8Array([1]));
    writeProjectFile("dist/assets/bg.png", new Uint8Array([1]));
    writeProjectFile("src/main.js", "console.log('hello');");

    // Exercise
    const scanResult = scanProjectFiles(projectPath);
    const validationResult = validateStaticAssets(
      projectPath,
      scanResult.paths,
    );

    // Verify
    expect(validationResult).toEqual({ errors: [], warnings: [] });
  });

  it("reports missing, root-absolute, and traversal references", () => {
    // Setup SUT
    writeProjectFile(".superegoignore", DEFAULT_SUPEREGOIGNORE);
    writeProjectFile(
      "dist/index.html",
      `
<!doctype html>
<script type="module" src="./missing.js"></script>
<script type="module" src="/assets/main.js"></script>
<img src="../outside.png">
<img src="https://example.com/logo.png">
`.trimStart(),
    );
    writeProjectFile("src/main.js", "console.log('hello');");

    // Exercise
    const scanResult = scanProjectFiles(projectPath);
    const validationResult = validateStaticAssets(
      projectPath,
      scanResult.paths,
    );

    // Verify
    expect(validationResult.errors).toEqual([
      "Missing referenced asset /dist/missing.js from /dist/index.html",
      "Root-absolute asset references are not supported: /assets/main.js",
      "Asset reference escapes /dist: ../outside.png",
    ]);
    expect(validationResult.warnings).toEqual([
      "External asset reference may be blocked by the runtime CSP: https://example.com/logo.png",
    ]);
  });
});

describe("install-deps", () => {
  it("materializes local packages and updates package.json without package manager output", () => {
    // Setup SUT
    writeProjectFile("package.json", JSON.stringify({ private: true }));

    // Exercise
    installBundledDependencies(projectPath, { react: true });

    // Verify
    const packageJson = JSON.parse(
      readFileSync(join(projectPath, "package.json"), "utf-8"),
    );
    expect(packageJson.dependencies).toMatchObject({
      "@superego/app-client": "file:./superego/packages/app-client",
      "@superego/app-react": "file:./superego/packages/app-react",
      react: "^19.2.6",
      "react-dom": "^19.2.6",
    });
    expect(packageJson.devDependencies).toMatchObject({
      "@types/react": "^19.2.14",
      "@types/react-dom": "^19.2.3",
    });
    expect(
      existsSync(join(projectPath, "superego/packages/app-client/index.js")),
    ).toBe(true);
    expect(
      existsSync(join(projectPath, "superego/packages/app-react/index.js")),
    ).toBe(true);
    expect(existsSync(join(projectPath, "node_modules"))).toBe(false);
    expect(existsSync(join(projectPath, "package-lock.json"))).toBe(false);
    expect(existsSync(join(projectPath, "yarn.lock"))).toBe(false);
    expect(existsSync(join(projectPath, "pnpm-lock.yaml"))).toBe(false);
  });
});

function writeProjectFile(path: string, content: string | Uint8Array): void {
  const filePath = join(projectPath, path);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}
