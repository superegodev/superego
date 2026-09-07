import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { AppStateDefinition } from "@superego/backend";
import { codegen, valibotSchemas } from "@superego/schema";
import { appStateSchema, isJsonValue } from "@superego/shared-utils";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import * as v from "valibot";
import { readJson, writeJson } from "./json.js";
import { readManifest } from "./manifest.js";

export const stateFiles = {
  schema: "state.schema.json",
  initialState: "state.initial.json",
  migration: "state.migration.ts",
} as const;
export function readStateSource(path: string) {
  const manifest = readManifest(path);
  const schema = v.parse(
    appStateSchema(),
    readJson(join(path, manifest.stateDefinition.schema)),
  );
  const initialState = readJson(
    join(path, manifest.stateDefinition.initialState),
  );
  if (
    !isJsonValue(initialState) ||
    !v.safeParse(valibotSchemas.content(schema), initialState).success
  ) {
    throw new Error("Initial state must match the state schema.");
  }
  return {
    schema,
    initialState: initialState as Record<string, unknown>,
    migration: manifest.stateDefinition.migration
      ? readFileSync(join(path, manifest.stateDefinition.migration), "utf8")
      : null,
  };
}
export function stateSourceOf(definition: AppStateDefinition) {
  return {
    schema: definition.schema,
    initialState: definition.initialState,
    migration: definition.migration?.source ?? null,
  };
}
export async function compileState(path: string): Promise<AppStateDefinition> {
  const source = readStateSource(path);
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
export async function writeStateSource(
  path: string,
  definition: AppStateDefinition,
) {
  await writeJson(join(path, stateFiles.schema), definition.schema);
  await writeJson(join(path, stateFiles.initialState), definition.initialState);
  if (definition.migration) {
    await writeFile(
      join(path, stateFiles.migration),
      definition.migration.source,
      "utf8",
    );
  }
}
