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
import { homedir } from "node:os";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import {
  AssistantName,
  AppType,
  type App,
  type AppId,
  type AppVersion,
  type AppVersionFile,
  AppVersionFiles,
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
import ignore from "ignore";

const MANIFEST_FILE_NAME = "superego.app.json";
const IGNORE_FILE_NAME = ".superegoignore";
const ENTRYPOINT = AppVersionFiles.APP_VERSION_ENTRYPOINT;

const DEFAULT_SUPEREGOIGNORE = `
/superego/
node_modules/
.git/
.env*
*.pem
*.key
*.crt
*.log
coverage/
.cache/
.vite/
.turbo/
.next/
.DS_Store
`.trimStart();

const RISKY_SNAPSHOT_PATH_PATTERNS = [
  /^\/\.env/,
  /^\/\.git(?:\/|$)/,
  /^\/node_modules(?:\/|$)/,
  /(?:^|\/)[^/]+\.(?:pem|key|crt)$/i,
];

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
    await writeProjectFromVersion(destination, app, backend);
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
      const metadataChanged =
        manifest.name !== app.name ||
        JSON.stringify(manifest.targetCollections) !==
          JSON.stringify(app.latestVersion.targetCollections);
      console.log(`Metadata changes: ${metadataChanged ? "yes" : "none"}`);
      if (manifest.name !== app.name) {
        console.log(`  name: ${app.name} -> ${manifest.name}`);
      }
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
    const result = await checkProject(resolve(folder), {
      backend: makeBackend(apps.opts()),
      requireTargetCollections: false,
    });
    for (const warning of result.warnings) {
      console.warn(warning);
    }
    if (result.errors.length > 0) {
      for (const error of result.errors) {
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
    const checkResult = await checkProject(projectPath, {
      backend,
      requireTargetCollections: true,
    });
    for (const warning of checkResult.warnings) {
      console.warn(warning);
    }
    if (checkResult.errors.length > 0) {
      for (const error of checkResult.errors) {
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
      if (manifest.name !== app.name) {
        const updateNameResult = await backend.apps.updateName(
          manifest.appId,
          manifest.name,
        );
        if (!updateNameResult.success) {
          throw new Error(JSON.stringify(updateNameResult.error, null, 2));
        }
      }
      if (
        app.latestVersion.id !== manifest.baseAppVersionId &&
        options.force === true
      ) {
        console.warn(
          `Force committing from stale base ${manifest.baseAppVersionId}; this creates a new version from local files and does not merge database changes.`,
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
  .option("--react", "Also add the React app helper package")
  .action((folder: string, options: { react?: boolean }) => {
    installBundledDependencies(resolve(folder), options);
    console.log(
      "Materialized Superego helper packages. Run your package manager install command when ready.",
    );
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
  writeFileSync(join(projectPath, IGNORE_FILE_NAME), DEFAULT_SUPEREGOIGNORE);
  await writeGeneratedFiles(projectPath, backend, manifest);
  writeManifest(projectPath, manifest);
}

async function writeProjectFromVersion(
  projectPath: string,
  app: App,
  backend: ReturnType<typeof makeBackend>,
): Promise<void> {
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
  await writeGeneratedFiles(projectPath, backend, {
    formatVersion: 1,
    appId: app.id,
    baseAppVersionId: app.latestVersion.id,
    name: app.name,
    type: app.type,
    targetCollections: app.latestVersion.targetCollections,
  });
  if (projectUsesBundledDependencies(projectPath)) {
    writeBundledDependencyPackages(projectPath);
  }
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
): Promise<{ errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!existsSync(projectPath) || !statSync(projectPath).isDirectory()) {
    return { errors: [`Folder does not exist: ${projectPath}`], warnings };
  }
  const manifestPath = join(projectPath, MANIFEST_FILE_NAME);
  if (!existsSync(manifestPath)) {
    return { errors: [`Missing ${MANIFEST_FILE_NAME}`], warnings };
  }

  let manifest: Manifest;
  try {
    manifest = readManifest(projectPath);
  } catch (error) {
    return {
      errors: [`Invalid ${MANIFEST_FILE_NAME}: ${(error as Error).message}`],
      warnings,
    };
  }

  errors.push(...validateManifest(manifest));
  if (errors.length > 0) {
    return { errors, warnings };
  }

  if (
    options.requireTargetCollections &&
    manifest.targetCollections.length === 0
  ) {
    errors.push("At least one target collection is required before commit.");
  }

  for (const root of ["src", "dist"]) {
    const rootPath = join(projectPath, root);
    if (!existsSync(rootPath) || !statSync(rootPath).isDirectory()) {
      errors.push(`Missing /${root} directory.`);
    }
  }
  if (!existsSync(join(projectPath, "dist", "index.html"))) {
    errors.push("Missing /dist/index.html.");
  }

  const seenCollectionIds = new Set<string>();
  for (const targetCollection of manifest.targetCollections) {
    if (seenCollectionIds.has(targetCollection.id)) {
      errors.push(`Duplicate target collection: ${targetCollection.id}.`);
    }
    seenCollectionIds.add(targetCollection.id);
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

  if (errors.length === 0) {
    await writeGeneratedFiles(projectPath, options.backend, manifest);
  }

  const scanResult = scanProjectFiles(projectPath);
  errors.push(...scanResult.errors);
  warnings.push(...scanResult.warnings);
  const staticAssetResult = validateStaticAssets(projectPath, scanResult.paths);
  errors.push(...staticAssetResult.errors);
  warnings.push(...staticAssetResult.warnings);
  warnings.push(
    ...(await warnForSourceBuildDrift(projectPath, options.backend)),
  );
  return { errors, warnings };
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
    scanProjectFiles(projectPath).paths.map((path) => [
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
    scanProjectFiles(projectPath).paths.map((filePath) => {
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

function scanProjectFiles(projectPath: string): {
  paths: `/${string}`[];
  errors: string[];
  warnings: string[];
} {
  const paths: `/${string}`[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const ignoreMatcher = makeSuperegoIgnore(projectPath);
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const absolutePath = join(dir, entry);
      const appPath =
        `/${relative(projectPath, absolutePath).split(sep).join("/")}` as `/${string}`;
      if (entry === MANIFEST_FILE_NAME || appPath.startsWith("/superego/")) {
        continue;
      }
      const stat = statSync(absolutePath);
      if (stat.isDirectory()) {
        visit(absolutePath);
      } else if (stat.isFile()) {
        const normalizedPath = AppVersionFiles.normalizeAppVersionPath(appPath);
        if (!normalizedPath) {
          errors.push(`Invalid project file path: ${appPath}`);
          continue;
        }
        if (ignoreMatcher.ignores(appPath)) {
          continue;
        }
        const role = AppVersionFiles.classifyAppProjectPath(normalizedPath);
        if (!role) {
          errors.push(`Reserved project file cannot be committed: ${appPath}`);
          continue;
        }
        if (stat.size > AppVersionFiles.APP_VERSION_FILE_SIZE_LIMIT_BYTES) {
          errors.push(
            `Project file exceeds ${AppVersionFiles.APP_VERSION_FILE_SIZE_LIMIT_BYTES} bytes: ${appPath}`,
          );
          continue;
        }
        if (
          RISKY_SNAPSHOT_PATH_PATTERNS.some((pattern) => pattern.test(appPath))
        ) {
          warnings.push(
            `Including risky project file in the app snapshot: ${appPath}`,
          );
        }
        paths.push(normalizedPath);
      }
    }
  };
  visit(projectPath);
  return { paths: paths.sort(), errors, warnings };
}

function makeSuperegoIgnore(projectPath: string): {
  ignores: (appPath: `/${string}`) => boolean;
} {
  const matcher = ignore();
  const explicitIncludeMatcher = ignore();
  const ignorePath = join(projectPath, IGNORE_FILE_NAME);
  if (existsSync(ignorePath)) {
    const ignoreFileContent = readFileSync(ignorePath, "utf-8");
    matcher.add(ignoreFileContent);
    explicitIncludeMatcher.add(
      ignoreFileContent
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith("!") && line !== "!")
        .map((line) => line.slice(1).trim()),
    );
  }
  return {
    ignores(appPath) {
      const relativePath = appPath.slice(1);
      return (
        matcher.ignores(relativePath) &&
        !explicitIncludeMatcher.ignores(relativePath)
      );
    },
  };
}

function validateStaticAssets(
  projectPath: string,
  paths: `/${string}`[],
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const pathSet = new Set(paths);
  const indexHtmlPath = join(projectPath, "dist", "index.html");
  if (!existsSync(indexHtmlPath)) {
    return { errors, warnings };
  }

  const validateReference = (ownerPath: `/${string}`, reference: string) => {
    const cleanReference = reference.trim();
    if (
      cleanReference === "" ||
      cleanReference.startsWith("#") ||
      cleanReference.startsWith("data:") ||
      cleanReference.startsWith("blob:") ||
      cleanReference.startsWith("mailto:") ||
      cleanReference.startsWith("javascript:")
    ) {
      return;
    }
    if (/^https?:\/\//i.test(cleanReference)) {
      warnings.push(
        `External asset reference may be blocked by the runtime CSP: ${cleanReference}`,
      );
      return;
    }
    if (cleanReference.startsWith("/")) {
      errors.push(
        `Root-absolute asset references are not supported: ${cleanReference}`,
      );
      return;
    }

    const [referenceWithoutQuery] = cleanReference.split(/[?#]/);
    const resolvedPath = resolveRelativeAppPath(
      ownerPath,
      referenceWithoutQuery!,
    );
    if (!resolvedPath || !resolvedPath.startsWith("/dist/")) {
      errors.push(`Asset reference escapes /dist: ${cleanReference}`);
      return;
    }
    if (!pathSet.has(resolvedPath)) {
      errors.push(`Missing referenced asset ${resolvedPath} from ${ownerPath}`);
    }
  };

  const indexHtml = readFileSync(indexHtmlPath, "utf-8");
  for (const reference of extractHtmlAssetReferences(indexHtml)) {
    validateReference("/dist/index.html", reference);
  }
  for (const path of paths) {
    if (!path.startsWith("/dist/") || !path.endsWith(".css")) {
      continue;
    }
    const content = readFileSync(join(projectPath, path.slice(1)), "utf-8");
    for (const reference of extractCssAssetReferences(content)) {
      validateReference(path, reference);
    }
  }

  for (const path of paths) {
    if (path.startsWith("/dist/") && path.endsWith(".map")) {
      warnings.push(
        `Source map will be stored and served with the app snapshot: ${path}`,
      );
    }
  }

  return { errors, warnings };
}

function resolveRelativeAppPath(
  ownerPath: `/${string}`,
  reference: string,
): `/${string}` | null {
  const segments = ownerPath
    .slice(1, ownerPath.lastIndexOf("/"))
    .split("/")
    .filter(Boolean);
  for (const segment of reference.split("/")) {
    if (segment === "" || segment === ".") {
      continue;
    }
    if (segment === "..") {
      if (segments.length === 0) {
        return null;
      }
      segments.pop();
      continue;
    }
    segments.push(segment);
  }
  return AppVersionFiles.normalizeAppVersionPath(`/${segments.join("/")}`);
}

function extractHtmlAssetReferences(html: string): string[] {
  const references: string[] = [];
  const tagRegex =
    /<(script|link|img|source)\b[^>]*(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(html)) !== null) {
    references.push(match[2]!);
  }
  return references;
}

function extractCssAssetReferences(css: string): string[] {
  const references: string[] = [];
  const urlRegex = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(css)) !== null) {
    references.push(match[1]!);
  }
  return references;
}

async function warnForSourceBuildDrift(
  projectPath: string,
  backend: ReturnType<typeof makeBackend>,
): Promise<string[]> {
  const warnings: string[] = [];
  let manifest: Manifest;
  try {
    manifest = readManifest(projectPath);
  } catch {
    return warnings;
  }
  if (!manifest.appId) {
    return warnings;
  }
  const appResult = await backend.apps.list();
  if (!appResult.success) {
    return warnings;
  }
  const app = appResult.data.find(({ id }) => id === manifest.appId);
  if (!app) {
    return warnings;
  }
  const localHashes = hashProjectFiles(projectPath);
  const databaseHashes = hashAppVersionFiles(app.latestVersion.files);
  const changedPaths = new Set([
    ...Object.keys(localHashes).filter(
      (path) =>
        databaseHashes[path as `/${string}`] !==
        localHashes[path as `/${string}`],
    ),
    ...Object.keys(databaseHashes).filter(
      (path) => localHashes[path as `/${string}`] === undefined,
    ),
  ] as `/${string}`[]);
  const hasEditableChanges = [...changedPaths].some(
    (path) => !path.startsWith("/dist/"),
  );
  const hasBuildChanges = [...changedPaths].some((path) =>
    path.startsWith("/dist/"),
  );
  if (hasEditableChanges && !hasBuildChanges) {
    warnings.push(
      "Source or project files changed, but /dist did not. Build output may be stale.",
    );
  }
  return warnings;
}

function roleForPath(path: string): AppVersionFile["role"] {
  const role = AppVersionFiles.classifyAppProjectPath(path);
  if (!role) {
    throw new Error(`Reserved app path cannot be persisted: ${path}`);
  }
  return role;
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
  const collectionsPath = join(projectPath, "superego", "collections");
  rmSync(collectionsPath, { recursive: true, force: true });
  mkdirSync(collectionsPath, { recursive: true });
  const collectionExports: string[] = [];
  if (backend) {
    for (const targetCollection of manifest.targetCollections) {
      const collectionVersion = await getCollectionVersion(
        backend,
        targetCollection,
      );
      const name = safeIdentifier(collectionVersion.id);
      const source = codegen(collectionVersion.schema);
      writeFileSync(join(collectionsPath, `${name}.ts`), source);
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
  if (
    path === "/.superegoignore" ||
    path.endsWith(".yaml") ||
    path.endsWith(".yml")
  ) {
    return "text/plain";
  }
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

function writeBundledDependencyPackages(projectPath: string): void {
  const packagesPath = join(projectPath, "superego", "packages");
  writePackage(
    join(packagesPath, "app-client"),
    appClientPackageJson(),
    APP_CLIENT_INDEX_JS,
    APP_CLIENT_INDEX_D_TS,
  );
  writePackage(
    join(packagesPath, "app-react"),
    appReactPackageJson(),
    APP_REACT_INDEX_JS,
    APP_REACT_INDEX_D_TS,
  );
}

function installBundledDependencies(
  projectPath: string,
  options: { react?: boolean },
): void {
  writeBundledDependencyPackages(projectPath);
  const packageJsonPath = join(projectPath, "package.json");
  const packageJson = existsSync(packageJsonPath)
    ? JSON.parse(readFileSync(packageJsonPath, "utf-8"))
    : {};
  packageJson.dependencies = {
    ...packageJson.dependencies,
    "@superego/app-client": "file:./superego/packages/app-client",
  };
  if (options.react === true) {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      "@superego/app-react": "file:./superego/packages/app-react",
      react: "^19.2.6",
      "react-dom": "^19.2.6",
    };
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      "@types/react": "^19.2.14",
      "@types/react-dom": "^19.2.3",
    };
  }
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function projectUsesBundledDependencies(projectPath: string): boolean {
  const packageJsonPath = join(projectPath, "package.json");
  if (!existsSync(packageJsonPath)) {
    return false;
  }
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  const dependencyValues = [
    ...Object.values(packageJson.dependencies ?? {}),
    ...Object.values(packageJson.devDependencies ?? {}),
  ];
  return dependencyValues.some(
    (value) =>
      typeof value === "string" && value.startsWith("file:./superego/"),
  );
}

function writePackage(
  packagePath: string,
  packageJsonContent: string,
  indexJs: string,
  indexDts: string,
): void {
  mkdirSync(packagePath, { recursive: true });
  writeFileSync(join(packagePath, "package.json"), packageJsonContent);
  writeFileSync(join(packagePath, "index.js"), indexJs);
  writeFileSync(join(packagePath, "index.d.ts"), indexDts);
}

function appClientPackageJson(): string {
  return `${JSON.stringify(
    {
      name: "@superego/app-client",
      version: "0.0.0",
      private: true,
      type: "module",
      exports: {
        ".": {
          types: "./index.d.ts",
          import: "./index.js",
        },
      },
    },
    null,
    2,
  )}\n`;
}

function appReactPackageJson(): string {
  return `${JSON.stringify(
    {
      name: "@superego/app-react",
      version: "0.0.0",
      private: true,
      type: "module",
      exports: {
        ".": {
          types: "./index.d.ts",
          import: "./index.js",
        },
      },
      peerDependencies: {
        "@superego/app-client": "*",
        react: ">=19",
        "react-dom": ">=19",
      },
    },
    null,
    2,
  )}\n`;
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

const APP_CLIENT_INDEX_JS = `
const invocations = new Map();
let responseListenerRegistered = false;

export async function connectSuperego() {
  ensureResponseListener();
  const renderPayload = await waitForRenderPayload();
  return {
    appProps: renderPayload.appProps,
    collections: renderPayload.appProps.collections,
    settings: renderPayload.settings,
    intlMessages: renderPayload.intlMessages,
    documents: {
      create(definition) {
        return invokeBackendMethod("documents", "create", [definition]);
      },
      createNewVersion(collectionId, documentId, latestVersionId, content) {
        return invokeBackendMethod("documents", "createNewVersion", [
          collectionId,
          documentId,
          latestVersionId,
          content,
        ]);
      },
      delete(collectionId, documentId) {
        return invokeBackendMethod("documents", "delete", [
          collectionId,
          documentId,
        ]);
      },
    },
    files: {
      getContent(id) {
        return invokeBackendMethod("files", "getContent", [id]);
      },
    },
    navigateTo(href) {
      window.parent.postMessage(
        {
          sender: "Sandbox",
          type: "NavigateHostTo",
          payload: { href },
        },
        "*",
      );
    },
  };
}

async function waitForRenderPayload() {
  return new Promise((resolve) => {
    const handleMessage = ({ data: message }) => {
      if (!isHostMessage(message)) {
        return;
      }

      if (message.type === "RenderApp") {
        window.removeEventListener("message", handleMessage);
        resolve(message.payload);
      }
    };
    window.addEventListener("message", handleMessage);
    window.parent.postMessage(
      { sender: "Sandbox", type: "SandboxReady", payload: null },
      "*",
    );
  });
}

function ensureResponseListener() {
  if (responseListenerRegistered) {
    return;
  }
  responseListenerRegistered = true;
  window.addEventListener("message", ({ data: message }) => {
    if (
      isHostMessage(message) &&
      message.type === "RespondToBackendMethodInvocation"
    ) {
      const resolveInvocation = invocations.get(message.payload.invocationId);
      if (resolveInvocation) {
        invocations.delete(message.payload.invocationId);
        resolveInvocation(message.payload.result);
      }
    }
  });
}

function invokeBackendMethod(entity, method, args) {
  const invocationId =
    crypto.randomUUID?.() ??
    String(Date.now()) + "-" + String(Math.random()).slice(2);
  return new Promise((resolve) => {
    invocations.set(invocationId, resolve);
    window.parent.postMessage(
      {
        sender: "Sandbox",
        type: "InvokeBackendMethod",
        payload: { invocationId, entity, method, args },
      },
      "*",
    );
  });
}

function isHostMessage(message) {
  return (
    typeof message === "object" &&
    message !== null &&
    message.sender === "Host" &&
    typeof message.type === "string"
  );
}
`.trimStart();

const APP_CLIENT_INDEX_D_TS = `
export interface SuperegoClient {
  appProps: any;
  collections: Record<string, any>;
  settings: any;
  intlMessages: any;
  documents: {
    create(definition: any): Promise<any>;
    createNewVersion(
      collectionId: string,
      documentId: string,
      latestVersionId: string,
      content: any,
    ): Promise<any>;
    delete(collectionId: string, documentId: string): Promise<any>;
  };
  files: {
    getContent(id: string): Promise<any>;
  };
  navigateTo(href: string): void;
}

export function connectSuperego(): Promise<SuperegoClient>;
`.trimStart();

const APP_REACT_INDEX_JS = `
import { connectSuperego } from "@superego/app-client";
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

export async function createSuperegoReactApp({ root, render }) {
  const client = await connectSuperego();
  createRoot(root).render(
    React.createElement(StrictMode, null, render(client.appProps, client)),
  );
}
`.trimStart();

const APP_REACT_INDEX_D_TS = `
import type { SuperegoClient } from "@superego/app-client";
import type { ReactElement } from "react";

export interface CreateSuperegoReactAppOptions {
  root: HTMLElement;
  render: (appProps: any, client: SuperegoClient) => ReactElement | null;
}

export function createSuperegoReactApp(
  options: CreateSuperegoReactAppOptions,
): Promise<void>;
`.trimStart();

export {
  DEFAULT_SUPEREGOIGNORE,
  installBundledDependencies,
  readProjectFiles,
  scanProjectFiles,
  validateStaticAssets,
  writeBundledDependencyPackages,
};
