import { join } from "node:path";
import { AppType } from "@superego/backend";
import { AppsUpdatePermissions } from "@superego/executing-backend";
import * as v from "valibot";
import getUsecaseArgumentsSchema from "../../../utils/getUsecaseArgumentsSchema.js";
import { readJson, writeJson } from "./json.js";
import type { AppManifest } from "./types.js";

export function readManifest(path: string): AppManifest {
  const data = readJson(join(path, "app.json"));
  const result = v.safeParse(
    v.object({
      name: v.string(),
      type: v.literal(AppType.CollectionView),
      targetCollectionIds: v.array(v.string()),
      permissions: getUsecaseArgumentsSchema(AppsUpdatePermissions).items[1],
      stateDefinition: v.strictObject({
        schema: v.literal("state.schema.json"),
        initialState: v.literal("state.initial.json"),
        migration: v.nullable(v.literal("state.migration.ts")),
      }),
    }),
    data,
  );
  if (!result.success) {
    const issues = result.issues.map((issue) => {
      const fieldPath = v.getDotPath(issue);
      return fieldPath ? `${fieldPath}: ${issue.message}` : issue.message;
    });
    throw new Error(`app.json is invalid: ${issues.join("; ")}`, {
      cause: new v.ValiError(result.issues),
    });
  }
  return data as AppManifest;
}

export async function writeManifest(
  path: string,
  manifest: AppManifest,
): Promise<void> {
  await writeJson(join(path, "app.json"), manifest);
}
