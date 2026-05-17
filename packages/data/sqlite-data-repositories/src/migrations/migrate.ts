import type { DatabaseSync } from "node:sqlite";
import { decode, encode } from "@msgpack/msgpack";
import { AppVersionFileUtils } from "@superego/backend";
import type { AppVersion } from "@superego/backend";
import m0000 from "./0000.sql?raw";
import m0001 from "./0001.sql?raw";
import m0002 from "./0002.sql?raw";
import m0003 from "./0003.sql?raw";
import m0004 from "./0004.sql?raw";
import m0005 from "./0005.sql?raw";
import m0006 from "./0006.sql?raw";
import m0007 from "./0007.sql?raw";
import m0008 from "./0008.sql?raw";
import m0009 from "./0009.sql?raw";
import m0010 from "./0010.sql?raw";
import m0011 from "./0011.sql?raw";

const migrationFiles = {
  "0000.sql": m0000,
  "0001.sql": m0001,
  "0002.sql": m0002,
  "0003.sql": m0003,
  "0004.sql": m0004,
  "0005.sql": m0005,
  "0006.sql": m0006,
  "0007.sql": m0007,
  "0008.sql": m0008,
  "0009.sql": m0009,
  "0010.sql": m0010,
  "0011.sql": m0011,
};
const table = "migrations";

interface SqliteMigration {
  file_name: string;
  /** ISO 8601 */
  applied_at: string;
}

export default function migrate(db: DatabaseSync) {
  db.exec("BEGIN IMMEDIATE");
  db.exec(`
    CREATE TABLE IF NOT EXISTS "${table}" (
      "file_name" TEXT PRIMARY KEY,
      "applied_at" TEXT NOT NULL
    )
  `);

  const migrationFileNames = (
    Object.keys(migrationFiles) as (keyof typeof migrationFiles)[]
  ).sort();

  const appliedMigrations = db
    .prepare(`SELECT * FROM "${table}"`)
    .all() as any as SqliteMigration[];

  ensureIntegrity(appliedMigrations, migrationFileNames);

  const insertMigration = db.prepare(
    `INSERT INTO "${table}" ("file_name", "applied_at") VALUES (?, ?)`,
  );
  for (const fileName of migrationFileNames) {
    if (appliedMigrations.some(({ file_name }) => file_name === fileName)) {
      continue;
    }
    db.exec(migrationFiles[fileName]);
    if (fileName === "0011.sql") {
      migrate0011StaticApps(db);
    }
    insertMigration.run(fileName, new Date().toISOString());
  }
  db.exec("COMMIT");
}

function migrate0011StaticApps(db: DatabaseSync): void {
  const collectionVersions = db
    .prepare(
      `SELECT "id", "collection_id", "is_latest" FROM "collection_versions"`,
    )
    .all() as {
    id: string;
    collection_id: string;
    is_latest: 0 | 1;
  }[];
  const latestCollectionVersionIdsByCollectionId = new Map(
    collectionVersions
      .filter(({ is_latest }) => is_latest === 1)
      .map(({ collection_id, id }) => [collection_id, id]),
  );
  const collectionIdsByVersionId = new Map(
    collectionVersions.map(({ id, collection_id }) => [id, collection_id]),
  );

  const appVersions = db
    .prepare(`SELECT "id", "target_collections", "files" FROM "app_versions"`)
    .all() as { id: string; target_collections: Buffer; files: Buffer }[];
  const updateAppVersion = db.prepare(`
    UPDATE "app_versions"
    SET "target_collections" = ?, "entrypoint" = ?, "files" = ?
    WHERE "id" = ?
  `);

  for (const appVersion of appVersions) {
    const targetCollections = normalizeTargetCollections(
      decode(appVersion.target_collections),
      latestCollectionVersionIdsByCollectionId,
      collectionIdsByVersionId,
    );
    const decodedFiles = decode(appVersion.files);
    const normalizedFiles = normalizeAlreadyStaticFiles(decodedFiles);
    const files =
      normalizedFiles &&
      AppVersionFileUtils.validateAppVersionFiles(
        AppVersionFileUtils.APP_VERSION_ENTRYPOINT,
        normalizedFiles,
      ).length === 0
        ? normalizedFiles
        : makeUnsupportedLegacyAppFiles(decodedFiles);

    updateAppVersion.run(
      encode(targetCollections),
      AppVersionFileUtils.APP_VERSION_ENTRYPOINT,
      encode(files),
      appVersion.id,
    );
  }
}

function normalizeTargetCollections(
  value: unknown,
  latestCollectionVersionIdsByCollectionId: Map<string, string>,
  collectionIdsByVersionId: Map<string, string>,
): AppVersion["targetCollections"] {
  if (!Array.isArray(value)) {
    return [];
  }
  const targetCollections: AppVersion["targetCollections"] = [];
  const seenCollectionIds = new Set<string>();
  for (const item of value) {
    const collectionId =
      typeof item === "string"
        ? item
        : typeof item === "object" &&
            item !== null &&
            typeof (item as any).id === "string"
          ? (item as any).id
          : null;
    if (!collectionId || seenCollectionIds.has(collectionId)) {
      continue;
    }
    const suppliedVersionId =
      typeof item === "object" &&
      item !== null &&
      typeof (item as any).versionId === "string"
        ? (item as any).versionId
        : null;
    const versionId =
      suppliedVersionId &&
      collectionIdsByVersionId.get(suppliedVersionId) === collectionId
        ? suppliedVersionId
        : latestCollectionVersionIdsByCollectionId.get(collectionId);
    if (!versionId) {
      continue;
    }
    seenCollectionIds.add(collectionId);
    targetCollections.push({
      id: collectionId as AppVersion["targetCollections"][number]["id"],
      versionId:
        versionId as AppVersion["targetCollections"][number]["versionId"],
    });
  }
  return targetCollections;
}

function normalizeAlreadyStaticFiles(
  value: unknown,
): AppVersion["files"] | null {
  if (!isRecord(value)) {
    return null;
  }
  const files: AppVersion["files"] = {};
  for (const [path, file] of Object.entries(value)) {
    if (!isRecord(file)) {
      return null;
    }
    const normalizedPath = AppVersionFileUtils.normalizeAppVersionPath(path);
    if (
      !normalizedPath ||
      AppVersionFileUtils.isReservedCheckoutPath(normalizedPath)
    ) {
      continue;
    }
    const role = file["role"] === "config" ? "projectConfig" : file["role"];
    if (role !== "source" && role !== "build" && role !== "projectConfig") {
      return null;
    }
    if (
      typeof file["mimeType"] !== "string" ||
      !(
        typeof file["content"] === "string" ||
        file["content"] instanceof Uint8Array
      )
    ) {
      return null;
    }
    files[normalizedPath] = {
      role,
      mimeType: file["mimeType"],
      content:
        typeof file["content"] === "string"
          ? file["content"]
          : new Uint8Array(file["content"]),
    };
  }
  return files;
}

function makeUnsupportedLegacyAppFiles(value: unknown): AppVersion["files"] {
  const files: AppVersion["files"] = {
    "/dist/index.html": {
      role: "build",
      mimeType: "text/html",
      content: `
<!doctype html>
<html>
  <body>
    <h1>Unsupported legacy app</h1>
    <p>This app was created before Superego switched to static HTML apps. Check it out and rebuild it to make it runnable again.</p>
  </body>
</html>
      `.trim(),
    },
    "/src/legacy/README.md": {
      role: "source",
      mimeType: "text/plain",
      content:
        "This app was migrated from the legacy app format. The original payload is preserved here where possible, but the app must be rebuilt as a static HTML app before it can run again.\n",
    },
    "/src/legacy/app-version-files.json": {
      role: "source",
      mimeType: "application/json",
      content: JSON.stringify(value, legacyJsonReplacer, 2),
    },
  };
  if (isRecord(value)) {
    for (const [path, file] of Object.entries(value)) {
      if (isRecord(file) && typeof file["source"] === "string") {
        files[`/src/legacy/${safeLegacyFileName(path)}` as `/${string}`] = {
          role: "source",
          mimeType: "text/plain",
          content: file["source"],
        };
      }
    }
  }
  return files;
}

function legacyJsonReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Uint8Array) {
    return {
      type: "Uint8Array",
      base64: Buffer.from(value).toString("base64"),
    };
  }
  return value;
}

function safeLegacyFileName(path: string): string {
  return path
    .replace(/^\/+/, "")
    .replaceAll("/", "__")
    .replaceAll(/[^A-Za-z0-9._-]/g, "_");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Ensures that:
 *
 * 1. Every applied migration has a corresponding migration file.
 * 2. No migrations were missed. That is, all migrations up to the latest
 *    applied migration have been applied.
 *
 * Note: migrations are applied (and MUST be applied) in alphabetical order by
 * their file name.
 */
function ensureIntegrity(
  appliedMigrations: SqliteMigration[],
  migrationFileNames: string[],
) {
  // If no migrations have been applied, there are no checks to run.
  if (appliedMigrations.length === 0) {
    return;
  }

  // Check #1.
  for (const { file_name } of appliedMigrations) {
    if (!migrationFileNames.includes(file_name)) {
      throw new Error(
        `Applied migration "${file_name}" has no corresponding file in the migrations directory.`,
      );
    }
  }

  // Check #2.
  const sortedAppliedMigrationFileNames = [...appliedMigrations]
    .map(({ file_name }) => file_name)
    .sort();
  const sortedMigrationFileNames = [...migrationFileNames].sort();
  for (let i = 0; i < sortedAppliedMigrationFileNames.length; i++) {
    if (sortedAppliedMigrationFileNames[i] !== sortedMigrationFileNames[i]) {
      throw new Error(
        `Migration "${sortedMigrationFileNames[i]}" was not applied.`,
      );
    }
  }
}
