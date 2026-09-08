import { join } from "node:path";
import { AppType } from "@superego/backend";
import { AppsCreateNewVersion } from "@superego/executing-backend";
import * as v from "valibot";
import getUsecaseArgumentsSchema from "../../../utils/getUsecaseArgumentsSchema.js";
import { readJson, writeJson } from "./json.js";
import type { AppManifest } from "./types.js";

export function readManifest(path: string): AppManifest {
  const data = readJson(join(path, "app.json"));
  v.parse(
    v.object({
      name: v.string(),
      type: v.literal(AppType.CollectionView),
      targetCollectionIds: v.array(v.string()),
      permissions: getUsecaseArgumentsSchema(AppsCreateNewVersion).items[4],
      stateDefinition: v.strictObject({
        schema: v.literal("state.schema.json"),
        initialState: v.literal("state.initial.json"),
        migration: v.nullable(v.literal("state.migration.ts")),
      }),
    }),
    data,
  );
  return data as AppManifest;
}

export async function writeManifest(
  path: string,
  manifest: AppManifest,
): Promise<void> {
  await writeJson(join(path, "app.json"), manifest);
}
