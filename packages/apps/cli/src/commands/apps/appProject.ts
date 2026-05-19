import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import typescriptLibs from "@superego/app-sandbox/typescript-libs";
import {
  AppType,
  type CollectionId,
  type CollectionVersion,
  type TypescriptFile,
  type TypescriptModule,
} from "@superego/backend";
import { codegen } from "@superego/schema";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";

export interface AppManifest {
  name: string;
  type: AppType.CollectionView;
  targetCollectionIds: CollectionId[];
}

export interface AppLock {
  appId: string;
  latestAppVersionId: string;
  targetCollections: {
    id: CollectionId;
    versionId: string;
  }[];
}

export interface TargetCollection {
  id: CollectionId;
  version: CollectionVersion;
  displayName: string;
}

export function assertEmptyTarget(path: string): void {
  if (!existsSync(path)) {
    return;
  }
  if (!statSync(path).isDirectory()) {
    throw new Error(`${path} exists and is not a directory.`);
  }
  const entries = readdirSync(path).filter((entry) => !entry.startsWith("."));
  if (entries.length > 0) {
    throw new Error(`${path} already exists and is not empty.`);
  }
}

export async function writeAppProject(
  path: string,
  manifest: AppManifest,
  mainSource: string,
  targetCollections: TargetCollection[],
  lock: AppLock | null,
): Promise<void> {
  await mkdir(path, { recursive: true });
  await writeJson(join(path, "app.json"), manifest);
  if (lock) {
    await writeJson(join(path, "app.lock.json"), lock);
  }
  await writeFile(join(path, "main.tsx"), mainSource, "utf-8");
  await regenerateGeneratedFiles(path, targetCollections);
}

export async function regenerateGeneratedFiles(
  path: string,
  targetCollections: TargetCollection[],
): Promise<void> {
  removeGeneratedCollectionFiles(path);
  for (const targetCollection of targetCollections) {
    await writeFile(
      join(path, `${targetCollection.id}.ts`),
      getCollectionTypescriptSource(
        targetCollection.id,
        targetCollection.version,
      ),
      "utf-8",
    );
  }
  await writeFile(join(path, "AGENTS.md"), appAgentsContent, "utf-8");
  await mkdir(join(path, ".agents", "skills", "writing-superego-apps"), {
    recursive: true,
  });
  await writeFile(
    join(path, ".agents", "skills", "writing-superego-apps", "SKILL.md"),
    appSkillContent,
    "utf-8",
  );
  await writeTypescriptLibs(path);
  await writeJson(join(path, "tsconfig.json"), tsconfig);
}

export function readManifest(path: string): AppManifest {
  const data = readJson(join(path, "app.json"));
  if (
    !isRecord(data) ||
    typeof data["name"] !== "string" ||
    data["type"] !== AppType.CollectionView ||
    !Array.isArray(data["targetCollectionIds"]) ||
    data["targetCollectionIds"].some((id) => typeof id !== "string")
  ) {
    throw new Error("app.json is invalid.");
  }
  return {
    name: data["name"],
    type: AppType.CollectionView,
    targetCollectionIds: data["targetCollectionIds"] as CollectionId[],
  };
}

export function readLock(path: string): AppLock | null {
  const lockPath = join(path, "app.lock.json");
  if (!existsSync(lockPath)) {
    return null;
  }
  const data = readJson(lockPath);
  if (
    !isRecord(data) ||
    typeof data["appId"] !== "string" ||
    typeof data["latestAppVersionId"] !== "string" ||
    !Array.isArray(data["targetCollections"]) ||
    data["targetCollections"].some(
      (targetCollection) =>
        !isRecord(targetCollection) ||
        typeof targetCollection["id"] !== "string" ||
        typeof targetCollection["versionId"] !== "string",
    )
  ) {
    throw new Error("app.lock.json is invalid.");
  }
  return data as unknown as AppLock;
}

export function readMainSource(path: string): string {
  const mainPath = join(path, "main.tsx");
  if (!existsSync(mainPath)) {
    throw new Error("main.tsx is missing.");
  }
  return readFileSync(mainPath, "utf-8");
}

export async function compileApp(
  path: string,
  targetCollections: TargetCollection[],
): Promise<TypescriptModule> {
  const source = readMainSource(path);
  const result = await new TscTypescriptCompiler().compile(
    { path: "/main.tsx", source },
    [...typescriptLibs, ...getCollectionTypescriptLibs(targetCollections)],
  );
  if (!result.success) {
    if (result.error.name === "TypescriptCompilationFailed") {
      throw new Error(
        result.error.details.reason === "TypeErrors"
          ? result.error.details.errors
          : "Missing output after compilation",
      );
    }
    throw new Error(JSON.stringify(result.error.details));
  }
  return { source, compiled: result.data };
}

export function buildLock(app: {
  id: string;
  latestVersion: {
    id: string;
    targetCollections: { id: CollectionId; versionId: string }[];
  };
}): AppLock {
  return {
    appId: app.id,
    latestAppVersionId: app.latestVersion.id,
    targetCollections: app.latestVersion.targetCollections,
  };
}

export function getCollectionTypescriptLibs(
  targetCollections: TargetCollection[],
): TypescriptFile[] {
  return targetCollections.map((targetCollection) => ({
    path: `/${targetCollection.id}.ts` as const,
    source: getCollectionTypescriptSource(
      targetCollection.id,
      targetCollection.version,
    ),
  }));
}

export function getCollectionTypescriptSource(
  id: CollectionId,
  version: CollectionVersion,
): string {
  return [
    `// Collection ID: ${id}`,
    `// Collection Version ID: ${version.id}`,
    "",
    codegen(version.schema),
  ].join("\n");
}

export function getInitialMainSource(collections: TargetCollection[]): string {
  const imports = collections.map(
    (collection) =>
      `import type * as ${collection.id} from "./${collection.id}.js";`,
  );
  const collectionFields =
    collections.length === 0
      ? "    Record<string, never>;"
      : [
          "    {",
          ...collections.map((collection) =>
            [
              `      ${collection.id}: {`,
              `        id: "${collection.id}";`,
              "        versionId: string;",
              "        displayName: string;",
              "        documents: {",
              "          id: string;",
              "          versionId: string;",
              "          href: string;",
              `          content: ${collection.id}.${collection.version.schema.rootType};`,
              "        }[];",
              "      };",
            ].join("\n"),
          ),
          "    };",
        ].join("\n");

  return [
    'import React from "react";',
    'import { DefaultApp } from "@superego/app-sandbox/components";',
    ...imports,
    "",
    "interface Props {",
    "  collections:",
    collectionFields,
    "}",
    "",
    "export default function App(props: Props): React.ReactElement | null {",
    "  return <DefaultApp {...props} />;",
    "}",
    "",
  ].join("\n");
}

export async function writeLock(path: string, lock: AppLock): Promise<void> {
  await writeJson(join(path, "app.lock.json"), lock);
}

export async function writeManifest(
  path: string,
  manifest: AppManifest,
): Promise<void> {
  await writeJson(join(path, "app.json"), manifest);
}

function removeGeneratedCollectionFiles(path: string): void {
  if (!existsSync(path)) {
    return;
  }
  for (const entry of readdirSync(path)) {
    if (/^Collection_.*\.ts$/.test(entry)) {
      rmSync(join(path, entry));
    }
  }
}

async function writeTypescriptLibs(path: string): Promise<void> {
  for (const lib of typescriptLibs) {
    const filePath = join(path, lib.path.slice(1));
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, lib.source, "utf-8");
  }
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf-8"));
}

async function writeJson(path: string, data: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const tsconfig = {
  compilerOptions: {
    target: "ESNext",
    module: "ESNext",
    moduleResolution: "Bundler",
    jsx: "react",
    strict: true,
    skipLibCheck: true,
    allowSyntheticDefaultImports: true,
  },
  include: ["main.tsx", "Collection_*.ts", "node_modules/**/*.d.ts"],
};

const appAgentsContent = `# Superego App Project

Durable files:

- \`app.json\`: editable app manifest.
- \`main.tsx\`: app source committed to Superego.

Generated files:

- \`app.lock.json\`, \`Collection_*.ts\`, \`AGENTS.md\`, \`.agents/**\`, \`node_modules/**\`, \`tsconfig.json\`.

Rules:

- Do not edit generated files directly.
- Use \`superego apps check\` before committing.
- Use \`superego apps commit\` to write durable changes to Superego.
- Runtime imports may use \`react\`, \`@superego/app-sandbox/components\`, \`@superego/app-sandbox/hooks\`, and \`@superego/app-sandbox/theme\`.
- Only \`main.tsx\` is committed as app source.
`;

const appSkillContent = `# Writing Superego Apps

Superego apps are single-entrypoint collection-view apps.

Project files:

- Edit \`app.json\` for name and target collections.
- Edit \`main.tsx\` for UI.
- Treat \`Collection_*.ts\`, \`node_modules/**\`, \`tsconfig.json\`, \`AGENTS.md\`, and \`.agents/**\` as generated.

Commands:

- \`superego apps check\`: validate and compile.
- \`superego apps status\`: compare local durable files with the database.
- \`superego apps add-collection Collection_...\`: add a target collection and regenerate types.
- \`superego apps remove-collection Collection_...\`: remove a target collection and regenerate types.
- \`superego apps commit\`: create/update the backend app.
`;
