import type { DatabaseSync } from "node:sqlite";
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
    insertMigration.run(fileName, new Date().toISOString());
  }
  db.exec("COMMIT");
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
