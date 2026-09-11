import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { AppStateDefinition } from "@superego/backend";
import { codegen } from "@superego/schema";
import { valibotSchemas } from "@superego/shared-utils";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import { isEqual } from "es-toolkit";
import * as v from "valibot";
import { readJson, writeJson } from "./json.js";
import { readManifest, writeManifest } from "./manifest.js";

export const stateDefinitionFiles = {
  schema: "state.schema.json",
  initialState: "state.initial.json",
  migration: "state.migration.ts",
} as const;

export function readStateDefinitionSource(path: string) {
  const manifest = readManifest(path);
  const schema = v.parse(
    valibotSchemas.appStateSchema(),
    readJson(join(path, manifest.stateDefinition.schema)),
  );
  const initialState = readJson(
    join(path, manifest.stateDefinition.initialState),
  );
  if (
    !v.safeParse(valibotSchemas.appStateContent(schema), initialState).success
  ) {
    throw new Error("Initial state must match the state schema.");
  }
  return {
    schema,
    initialState,
    migration: manifest.stateDefinition.migration
      ? readFileSync(join(path, manifest.stateDefinition.migration), "utf8")
      : null,
  };
}

export function stateDefinitionSourceOf(definition: AppStateDefinition) {
  return {
    schema: definition.schema,
    initialState: definition.initialState,
    migration: definition.migration?.source ?? null,
  };
}

export function hasStateDefinitionChanges(
  source: ReturnType<typeof readStateDefinitionSource>,
  definition: AppStateDefinition,
): boolean {
  // A local migration is pending; the previous version's migration is history.
  return (
    source.migration !== null ||
    !isEqual(source.schema, definition.schema) ||
    !isEqual(source.initialState, definition.initialState)
  );
}

export async function clearPendingMigration(path: string): Promise<void> {
  const manifest = readManifest(path);
  if (manifest.stateDefinition.migration !== null) {
    manifest.stateDefinition.migration = null;
    await writeManifest(path, manifest);
  }
}

export async function compileStateDefinition(
  path: string,
): Promise<AppStateDefinition> {
  const source = readStateDefinitionSource(path);
  if (source.migration === null) {
    return { ...source, migration: null };
  }
  const result = await new TscTypescriptCompiler().compile(
    { path: "/state.migration.ts", source: source.migration },
    [{ path: "/app-state.ts", source: codegen(source.schema) }],
  );
  if (!result.success) {
    throw new Error(JSON.stringify(result.error));
  }
  return {
    ...source,
    migration: { source: source.migration, compiled: result.data },
  };
}

export async function writeStateDefinitionSource(
  path: string,
  definition: AppStateDefinition,
) {
  await writeJson(join(path, stateDefinitionFiles.schema), definition.schema);
  await writeJson(
    join(path, stateDefinitionFiles.initialState),
    definition.initialState,
  );
  if (definition.migration) {
    await writeFile(
      join(path, stateDefinitionFiles.migration),
      definition.migration.source,
      "utf8",
    );
  }
}
