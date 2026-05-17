import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import {
  AssistantName,
  AppType,
  type App,
  type AppId,
  type AppVersion,
  type AppVersionFile,
  type Collection,
  type CollectionVersion,
  Theme,
} from "@superego/backend";
import { ExecutingBackend } from "@superego/executing-backend";
import { MultiDriverInferenceServiceFactory } from "@superego/multi-driver-inference-service";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/nodejs";
import { codegen } from "@superego/schema";
import { SqliteDataRepositoriesManager } from "@superego/sqlite-data-repositories";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import { Command } from "commander";

const MANIFEST_FILE_NAME = "superego.app.json";
const ENTRYPOINT = "/dist/index.html";
const IGNORED_DIR_NAMES = new Set([".git", "node_modules"]);
const ROOT_CONFIG_FILE_PATHS = new Set<`/${string}`>([
  "/package.json",
  "/package-lock.json",
]);
const require = createRequire(import.meta.url);

interface Manifest {
  formatVersion: 1;
  appId: AppId | null;
  baseAppVersionId: AppVersion["id"] | null;
  name: string;
  type: AppType.CollectionView;
  targetCollections: AppVersion["targetCollections"];
}

interface AppsCommandOptions {
  database?: string;
}

const apps = new Command("apps").description("Create and manage Superego apps");

apps
  .command("create")
  .description("Create a local app working folder")
  .argument("<folder>", "Folder to create")
  .requiredOption("--name <name>", "App name")
  .option(
    "-c, --collection <collection-ref>",
    "Target collection id or exact unique name",
    collect,
    [] as string[],
  )
  .action(
    async (folder: string, options: { name: string; collection: string[] }) => {
      const backend =
        options.collection.length > 0 ? makeBackend(apps.opts()) : null;
      const targetCollections = backend
        ? await resolveCollectionRefs(backend, options.collection)
        : [];
      await writeProject(
        resolve(folder),
        {
          formatVersion: 1,
          appId: null,
          baseAppVersionId: null,
          name: options.name,
          type: AppType.CollectionView,
          targetCollections,
        },
        backend,
      );
      console.log(`Created app folder at ${resolve(folder)}`);
    },
  );

apps
  .command("checkout")
  .description("Checkout an installed app into an editable folder")
  .argument("<app-ref>", "App id or exact unique name")
  .argument("[folder]", "Destination folder")
  .action(async (appRef: string, folder?: string) => {
    const backend = makeBackend(apps.opts());
    const app = await resolveAppRef(backend, appRef);
    const destination = resolve(folder ?? app.name.replaceAll(sep, "-"));
    writeProjectFromVersion(destination, app);
    console.log(`Checked out ${app.name} to ${destination}`);
  });

apps
  .command("status")
  .description("Compare an app folder with the database")
  .argument("[folder]", "App folder", ".")
  .action(async (folder: string) => {
    const backend = makeBackend(apps.opts());
    const projectPath = resolve(folder);
    const manifest = readManifest(projectPath);
    const localHashes = hashProjectFiles(projectPath);
    let app: App | null = null;
    let addedPaths: string[];
    let modifiedPaths: string[];
    let deletedPaths: string[];

    if (manifest.appId) {
      app = await resolveAppRef(backend, manifest.appId);
      const databaseHashes = hashAppVersionFiles(app.latestVersion.files);
      addedPaths = Object.keys(localHashes)
        .filter((path) => databaseHashes[path as `/${string}`] === undefined)
        .sort();
      modifiedPaths = Object.entries(localHashes)
        .filter(
          ([path, hash]) =>
            databaseHashes[path as `/${string}`] !== undefined &&
            databaseHashes[path as `/${string}`] !== hash,
        )
        .map(([path]) => path)
        .sort();
      deletedPaths = Object.keys(databaseHashes)
        .filter((path) => localHashes[path as `/${string}`] === undefined)
        .sort();
    } else {
      addedPaths = Object.keys(localHashes).sort();
      modifiedPaths = [];
      deletedPaths = [];
    }

    console.log(`App: ${manifest.name}`);
    console.log(`Folder: ${projectPath}`);
    console.log(
      `Local changes: ${
        addedPaths.length + modifiedPaths.length + deletedPaths.length === 0
          ? "none"
          : "yes"
      }`,
    );
    for (const path of addedPaths) {
      console.log(`  added: ${path}`);
    }
    for (const path of modifiedPaths) {
      console.log(`  modified: ${path}`);
    }
    for (const path of deletedPaths) {
      console.log(`  deleted: ${path}`);
    }

    if (app) {
      console.log(
        `Base version: ${
          manifest.baseAppVersionId === app.latestVersion.id
            ? "current"
            : "stale"
        }`,
      );
      console.log(
        `Target collections: ${
          JSON.stringify(manifest.targetCollections) ===
          JSON.stringify(app.latestVersion.targetCollections)
            ? "unchanged"
            : "changed"
        }`,
      );
    } else {
      console.log("Base version: new app");
    }

    const collections = await listCollections(backend);
    for (const targetCollection of manifest.targetCollections) {
      const collection = collections.find(
        ({ id }) => id === targetCollection.id,
      );
      if (collection) {
        console.log(
          `Collection ${collection.settings.name}: ${
            collection.latestVersion.id === targetCollection.versionId
              ? "current"
              : "stale"
          }`,
        );
      }
    }
  });

apps
  .command("check")
  .description("Validate an app folder")
  .argument("[folder]", "App folder", ".")
  .action(async (folder: string) => {
    const errors = await checkProject(resolve(folder), {
      backend: makeBackend(apps.opts()),
      requireTargetCollections: false,
    });
    if (errors.length > 0) {
      for (const error of errors) {
        console.error(error);
      }
      process.exitCode = 1;
      return;
    }
    console.log("App folder is valid.");
  });

apps
  .command("commit")
  .description("Commit an app folder as a new app version")
  .argument("[folder]", "App folder", ".")
  .option("--force", "Allow committing over a stale base app version")
  .action(async (folder: string, options: { force?: boolean }) => {
    const projectPath = resolve(folder);
    const backend = makeBackend(apps.opts());
    const errors = await checkProject(projectPath, {
      backend,
      requireTargetCollections: true,
    });
    if (errors.length > 0) {
      for (const error of errors) {
        console.error(error);
      }
      process.exit(1);
    }

    const manifest = readManifest(projectPath);
    const files = readProjectFiles(projectPath);
    let committedApp: App;

    if (manifest.appId === null) {
      const result = await backend.apps.create({
        type: AppType.CollectionView,
        name: manifest.name,
        targetCollections: manifest.targetCollections,
        entrypoint: ENTRYPOINT,
        files,
      });
      if (!result.success) {
        throw new Error(JSON.stringify(result.error, null, 2));
      }
      committedApp = result.data;
    } else {
      const app = await resolveAppRef(backend, manifest.appId);
      if (
        app.latestVersion.id !== manifest.baseAppVersionId &&
        options.force !== true
      ) {
        throw new Error(
          `Folder is based on ${manifest.baseAppVersionId}, but latest is ${app.latestVersion.id}. Use --force to commit anyway.`,
        );
      }
      const result = await backend.apps.createNewVersion(
        manifest.appId,
        manifest.targetCollections,
        ENTRYPOINT,
        files,
      );
      if (!result.success) {
        throw new Error(JSON.stringify(result.error, null, 2));
      }
      committedApp = result.data;
    }

    writeManifest(projectPath, {
      ...manifest,
      appId: committedApp.id,
      baseAppVersionId: committedApp.latestVersion.id,
      targetCollections: committedApp.latestVersion.targetCollections,
    });
    console.log(
      `Committed ${committedApp.name} (${committedApp.latestVersion.id}).`,
    );
  });

apps
  .command("install-deps")
  .description("Install bundled Superego helper packages")
  .argument("[folder]", "App folder", ".")
  .action((folder: string) => {
    const projectPath = resolve(folder);
    const packageJsonPath = join(projectPath, "package.json");
    const packageJson = existsSync(packageJsonPath)
      ? JSON.parse(readFileSync(packageJsonPath, "utf-8"))
      : {};
    packageJson.dependencies = {
      ...packageJson.dependencies,
      "@superego/app-client": `file:${packageDir("@superego/app-client")}`,
      "@superego/app-components": `file:${packageDir("@superego/app-components")}`,
      "@superego/app-react": `file:${packageDir("@superego/app-react")}`,
      react: "^19.2.6",
      "react-dom": "^19.2.6",
    };
    writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
    const result = spawnSync("npm", ["install"], {
      cwd: projectPath,
      stdio: "inherit",
    });
    process.exitCode = result.status ?? 1;
  });

apps
  .command("add-collection")
  .description("Add a target collection to an app folder")
  .argument("<collection-ref>", "Collection id or exact unique name")
  .argument("[folder]", "App folder", ".")
  .action(async (collectionRef: string, folder: string) => {
    const backend = makeBackend(apps.opts());
    const projectPath = resolve(folder);
    const manifest = readManifest(projectPath);
    const [targetCollection] = await resolveCollectionRefs(backend, [
      collectionRef,
    ]);
    if (
      !manifest.targetCollections.some(({ id }) => id === targetCollection!.id)
    ) {
      manifest.targetCollections.push(targetCollection!);
    }
    await writeGeneratedFiles(projectPath, backend, manifest);
    writeManifest(projectPath, manifest);
  });

apps
  .command("remove-collection")
  .description("Remove a target collection from an app folder")
  .argument("<collection-ref>", "Collection id or exact unique name")
  .argument("[folder]", "App folder", ".")
  .action(async (collectionRef: string, folder: string) => {
    const backend = makeBackend(apps.opts());
    const projectPath = resolve(folder);
    const manifest = readManifest(projectPath);
    const [targetCollection] = await resolveCollectionRefs(backend, [
      collectionRef,
    ]);
    manifest.targetCollections = manifest.targetCollections.filter(
      ({ id }) => id !== targetCollection!.id,
    );
    rmSync(join(projectPath, "superego"), { recursive: true, force: true });
    await writeGeneratedFiles(projectPath, backend, manifest);
    writeManifest(projectPath, manifest);
  });

apps.option("--database <path>", "Path to the Superego SQLite database");

export default apps;

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

function makeBackend(options: AppsCommandOptions) {
  const defaultGlobalSettings = {
    appearance: { theme: Theme.Auto },
    inference: {
      providers: [],
      defaultInferenceOptions: {
        completion: null,
        transcription: null,
        fileInspection: null,
      },
    },
    assistants: {
      userInfo: null,
      userPreferences: null,
      developerPrompts: {
        [AssistantName.Factotum]: null,
        [AssistantName.CollectionCreator]: null,
      },
    },
  };
  const manager = new SqliteDataRepositoriesManager({
    fileName: resolve(options.database ?? defaultDatabasePath()),
    defaultGlobalSettings,
  });
  manager.runMigrations();
  return new ExecutingBackend(
    manager,
    new QuickjsJavascriptSandbox(),
    new TscTypescriptCompiler(),
    new MultiDriverInferenceServiceFactory(),
    [],
  );
}

function defaultDatabasePath(): string {
  if (process.platform === "darwin") {
    return join(
      homedir(),
      "Library",
      "Application Support",
      "superego",
      "superego.db",
    );
  }
  if (process.platform === "win32") {
    return join(
      process.env["APPDATA"] ?? join(homedir(), "AppData", "Roaming"),
      "superego",
      "superego.db",
    );
  }
  return join(
    process.env["XDG_CONFIG_HOME"] ?? join(homedir(), ".config"),
    "superego",
    "superego.db",
  );
}

async function writeProject(
  projectPath: string,
  manifest: Manifest,
  backend: ReturnType<typeof makeBackend> | null,
): Promise<void> {
  if (existsSync(projectPath) && readdirSync(projectPath).length > 0) {
    throw new Error(`Folder is not empty: ${projectPath}`);
  }
  mkdirSync(projectPath, { recursive: true });
  mkdirSync(join(projectPath, "src"), { recursive: true });
  mkdirSync(join(projectPath, "dist"), { recursive: true });
  writeFileSync(join(projectPath, "src", "main.js"), sourceMainJs());
  writeFileSync(
    join(projectPath, "dist", "index.html"),
    distIndexHtml(manifest.name),
  );
  writeFileSync(join(projectPath, "dist", "main.js"), distMainJs());
  writeFileSync(join(projectPath, "package.json"), packageJson(manifest.name));
  await writeGeneratedFiles(projectPath, backend, manifest);
  writeManifest(projectPath, manifest);
}

function writeProjectFromVersion(projectPath: string, app: App): void {
  if (existsSync(projectPath) && readdirSync(projectPath).length > 0) {
    throw new Error(`Folder is not empty: ${projectPath}`);
  }
  mkdirSync(projectPath, { recursive: true });
  for (const [filePath, file] of Object.entries(app.latestVersion.files)) {
    writeAppVersionFile(projectPath, filePath as `/${string}`, file);
  }
  writeManifest(projectPath, {
    formatVersion: 1,
    appId: app.id,
    baseAppVersionId: app.latestVersion.id,
    name: app.name,
    type: app.type,
    targetCollections: app.latestVersion.targetCollections,
  });
}

function readManifest(projectPath: string): Manifest {
  return JSON.parse(
    readFileSync(join(projectPath, MANIFEST_FILE_NAME), "utf-8"),
  ) as Manifest;
}

function writeManifest(projectPath: string, manifest: Manifest): void {
  writeFileSync(
    join(projectPath, MANIFEST_FILE_NAME),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

async function checkProject(
  projectPath: string,
  options: {
    backend: ReturnType<typeof makeBackend>;
    requireTargetCollections: boolean;
  },
): Promise<string[]> {
  const errors: string[] = [];
  if (!existsSync(projectPath) || !statSync(projectPath).isDirectory()) {
    return [`Folder does not exist: ${projectPath}`];
  }
  const manifestPath = join(projectPath, MANIFEST_FILE_NAME);
  if (!existsSync(manifestPath)) {
    return [`Missing ${MANIFEST_FILE_NAME}`];
  }

  let manifest: Manifest;
  try {
    manifest = readManifest(projectPath);
  } catch (error) {
    return [`Invalid ${MANIFEST_FILE_NAME}: ${(error as Error).message}`];
  }

  errors.push(...validateManifest(manifest));
  if (errors.length > 0) {
    return errors;
  }

  if (
    options.requireTargetCollections &&
    manifest.targetCollections.length === 0
  ) {
    errors.push("At least one target collection is required before commit.");
  }

  for (const root of ["src", "dist", "superego"]) {
    const rootPath = join(projectPath, root);
    if (!existsSync(rootPath) || !statSync(rootPath).isDirectory()) {
      errors.push(`Missing /${root} directory.`);
    }
  }
  if (!existsSync(join(projectPath, "dist", "index.html"))) {
    errors.push("Missing /dist/index.html.");
  }
  if (!existsSync(join(projectPath, "superego", "app.ts"))) {
    errors.push("Missing /superego/app.ts.");
  }

  const seenCollectionIds = new Set<string>();
  for (const targetCollection of manifest.targetCollections) {
    if (seenCollectionIds.has(targetCollection.id)) {
      errors.push(`Duplicate target collection: ${targetCollection.id}.`);
    }
    seenCollectionIds.add(targetCollection.id);
    const expectedTypesPath = join(
      projectPath,
      "superego",
      "collections",
      `${safeIdentifier(targetCollection.versionId)}.ts`,
    );
    if (!existsSync(expectedTypesPath)) {
      errors.push(
        `Missing generated types for collection version ${targetCollection.versionId}.`,
      );
    }
    const collectionVersionResult =
      await options.backend.collections.getVersion(
        targetCollection.id,
        targetCollection.versionId,
      );
    if (!collectionVersionResult.success) {
      errors.push(
        `Target collection version not found: ${targetCollection.id} ${targetCollection.versionId}.`,
      );
    }
  }

  for (const path of Object.keys(hashProjectFiles(projectPath))) {
    if (
      !path.startsWith("/src/") &&
      !path.startsWith("/dist/") &&
      !path.startsWith("/superego/") &&
      !ROOT_CONFIG_FILE_PATHS.has(path as `/${string}`)
    ) {
      errors.push(`Unexpected project file: ${path}`);
    }
  }
  return errors;
}

function validateManifest(manifest: Manifest): string[] {
  const errors: string[] = [];
  if (manifest.formatVersion !== 1) {
    errors.push("Manifest formatVersion must be 1.");
  }
  if (manifest.appId !== null && typeof manifest.appId !== "string") {
    errors.push("Manifest appId must be a string or null.");
  }
  if (
    manifest.baseAppVersionId !== null &&
    typeof manifest.baseAppVersionId !== "string"
  ) {
    errors.push("Manifest baseAppVersionId must be a string or null.");
  }
  if (typeof manifest.name !== "string" || manifest.name.length === 0) {
    errors.push("Manifest name must be a non-empty string.");
  }
  if (manifest.type !== AppType.CollectionView) {
    errors.push("Manifest type must be CollectionView.");
  }
  if (!Array.isArray(manifest.targetCollections)) {
    errors.push("Manifest targetCollections must be an array.");
  } else {
    for (const targetCollection of manifest.targetCollections) {
      if (
        typeof targetCollection !== "object" ||
        targetCollection === null ||
        typeof targetCollection.id !== "string" ||
        typeof targetCollection.versionId !== "string"
      ) {
        errors.push(
          "Manifest targetCollections entries must contain string id and versionId.",
        );
      }
    }
  }
  return errors;
}

function hashProjectFiles(projectPath: string): Record<`/${string}`, string> {
  return Object.fromEntries(
    listProjectFilePaths(projectPath).map((path) => [
      path,
      hashBytes(readFileSync(join(projectPath, path.slice(1)))),
    ]),
  ) as Record<`/${string}`, string>;
}

function hashAppVersionFiles(
  files: AppVersion["files"],
): Record<`/${string}`, string> {
  return Object.fromEntries(
    Object.entries(files).map(([path, file]) => [
      path,
      hashBytes(
        typeof file.content === "string"
          ? Buffer.from(file.content, "utf-8")
          : file.content,
      ),
    ]),
  ) as Record<`/${string}`, string>;
}

function readProjectFiles(projectPath: string): AppVersion["files"] {
  return Object.fromEntries(
    listProjectFilePaths(projectPath).map((filePath) => {
      const absolutePath = join(projectPath, filePath.slice(1));
      const bytes = readFileSync(absolutePath);
      const mimeType = inferMimeType(filePath);
      const isText = isTextMimeType(mimeType);
      const file: AppVersionFile = {
        role: roleForPath(filePath),
        mimeType,
        content: isText ? bytes.toString("utf-8") : new Uint8Array(bytes),
      };
      return [filePath, file];
    }),
  ) as AppVersion["files"];
}

function listProjectFilePaths(projectPath: string): `/${string}`[] {
  const paths: `/${string}`[] = [];
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (IGNORED_DIR_NAMES.has(entry) || entry === MANIFEST_FILE_NAME) {
        continue;
      }
      const absolutePath = join(dir, entry);
      const stat = statSync(absolutePath);
      if (stat.isDirectory()) {
        visit(absolutePath);
      } else if (stat.isFile()) {
        paths.push(
          `/${relative(projectPath, absolutePath).split(sep).join("/")}`,
        );
      }
    }
  };
  visit(projectPath);
  return paths.sort();
}

function roleForPath(path: string): AppVersionFile["role"] {
  if (path.startsWith("/dist/")) {
    return "build";
  }
  if (path.startsWith("/superego/")) {
    return "generated";
  }
  if (ROOT_CONFIG_FILE_PATHS.has(path as `/${string}`)) {
    return "config";
  }
  return "source";
}

async function resolveAppRef(
  backend: ReturnType<typeof makeBackend>,
  appRef: string,
): Promise<App> {
  const result = await backend.apps.list();
  if (!result.success) {
    throw new Error(JSON.stringify(result.error, null, 2));
  }
  const byId = result.data.find(({ id }) => id === appRef);
  if (byId) {
    return byId;
  }
  const byName = result.data.filter(({ name }) => name === appRef);
  if (byName.length !== 1) {
    throw new Error(
      `Expected exactly one app named or identified by "${appRef}".`,
    );
  }
  return byName[0]!;
}

async function resolveCollectionRefs(
  backend: ReturnType<typeof makeBackend>,
  refs: string[],
): Promise<AppVersion["targetCollections"]> {
  const collections = await listCollections(backend);
  return refs.map((ref) => {
    const byId = collections.find(({ id }) => id === ref);
    const collection = byId ?? uniqueByName(collections, ref, "collection");
    return { id: collection.id, versionId: collection.latestVersion.id };
  });
}

async function listCollections(
  backend: ReturnType<typeof makeBackend>,
): Promise<Collection[]> {
  const result = await backend.collections.list();
  if (!result.success) {
    throw new Error(JSON.stringify(result.error, null, 2));
  }
  return result.data;
}

function uniqueByName<T extends { name?: string; settings?: { name: string } }>(
  items: T[],
  name: string,
  label: string,
): T {
  const matches = items.filter(
    (item) => (item.name ?? item.settings?.name) === name,
  );
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${label} named "${name}".`);
  }
  return matches[0]!;
}

async function writeGeneratedFiles(
  projectPath: string,
  backend: ReturnType<typeof makeBackend> | null,
  manifest: Manifest,
): Promise<void> {
  mkdirSync(join(projectPath, "superego", "collections"), { recursive: true });
  const collectionExports: string[] = [];
  if (backend) {
    for (const targetCollection of manifest.targetCollections) {
      const collectionVersion = await getCollectionVersion(
        backend,
        targetCollection,
      );
      const name = safeIdentifier(collectionVersion.id);
      const source = codegen(collectionVersion.schema);
      writeFileSync(
        join(projectPath, "superego", "collections", `${name}.ts`),
        source,
      );
      collectionExports.push(
        `export type * as ${name} from "./collections/${name}.js";`,
      );
    }
  }
  writeFileSync(
    join(projectPath, "superego", "app.ts"),
    `${collectionExports.join("\n")}\n`,
  );
}

async function getCollectionVersion(
  backend: ReturnType<typeof makeBackend>,
  targetCollection: AppVersion["targetCollections"][number],
): Promise<CollectionVersion> {
  const result = await backend.collections.getVersion(
    targetCollection.id,
    targetCollection.versionId,
  );
  if (!result.success) {
    throw new Error(
      `Failed to load collection version ${targetCollection.versionId}.`,
    );
  }
  return result.data;
}

function writeAppVersionFile(
  projectPath: string,
  filePath: `/${string}`,
  file: AppVersionFile,
): void {
  const outputPath = join(projectPath, filePath.slice(1));
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, file.content);
}

function inferMimeType(path: string): string {
  switch (extname(path).toLowerCase()) {
    case ".html":
      return "text/html";
    case ".js":
    case ".mjs":
      return "text/javascript";
    case ".css":
      return "text/css";
    case ".json":
      return "application/json";
    case ".ts":
    case ".tsx":
      return "text/plain";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

function isTextMimeType(mimeType: string): boolean {
  return (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "image/svg+xml"
  );
}

function hashBytes(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function safeIdentifier(value: string): string {
  return value.replaceAll(/[^A-Za-z0-9_$]/g, "_");
}

function packageDir(name: string): string {
  let current = dirname(require.resolve(name));
  while (!existsSync(join(current, "package.json"))) {
    const parent = dirname(current);
    if (parent === current) {
      throw new Error(`Could not find package directory for ${name}.`);
    }
    current = parent;
  }
  return current;
}

function packageJson(name: string): string {
  return `${JSON.stringify(
    {
      name: name.toLowerCase().replaceAll(/[^a-z0-9-]/g, "-"),
      private: true,
      type: "module",
      scripts: {
        build: 'echo "No build configured"',
      },
    },
    null,
    2,
  )}\n`;
}

function sourceMainJs(): string {
  return `
import { connectSuperego } from "@superego/app-client";

const superego = await connectSuperego();
document.getElementById("root").textContent =
  \`Connected to \${Object.keys(superego.collections).length} collection(s).\`;
`.trimStart();
}

function distIndexHtml(title: string): string {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.js"></script>
  </body>
</html>
`.trimStart();
}

function distMainJs(): string {
  return `
const invocations = new Map();
window.addEventListener("message", ({ data: message }) => {
  if (message && message.sender === "Host" && message.type === "RenderApp") {
    const count = Object.keys(message.payload.appProps.collections).length;
    document.getElementById("root").textContent =
      \`Connected to \${count} collection(s).\`;
  } else if (
    message &&
    message.sender === "Host" &&
    message.type === "RespondToBackendMethodInvocation"
  ) {
    const resolve = invocations.get(message.payload.invocationId);
    if (resolve) {
      invocations.delete(message.payload.invocationId);
      resolve(message.payload.result);
    }
  }
});
window.parent.postMessage(
  { sender: "Sandbox", type: "SandboxReady", payload: null },
  "*",
);
`.trimStart();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
