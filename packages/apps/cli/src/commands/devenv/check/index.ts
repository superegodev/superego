import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Schema } from "@superego/schema";
import getProtoApps from "../utils/getProtoApps.js";
import getProtoCollections from "../utils/getProtoCollections.js";
import Log from "../utils/Log.js";
import packJsonSchema from "../utils/packJsonSchema.js";
import type CheckResult from "./CheckResult.js";
import checkApp from "./checkApp.js";
import checkCollection from "./checkCollection.js";
import checkJsonValidation from "./checkJsonValidation.js";

export default async function checkAction(): Promise<void> {
  const basePath = process.cwd();
  const results: CheckResult[] = [];
  const schemas = new Map<string, Schema>();

  const packJsonPath = join(basePath, "pack.json");
  if (existsSync(packJsonPath)) {
    results.push(
      checkJsonValidation("pack.json", packJsonPath, packJsonSchema()),
    );
  }

  const collections = getProtoCollections(basePath);
  for (const collectionName of collections) {
    const { results: collectionResults, schema } = await checkCollection(
      basePath,
      collectionName,
    );
    results.push(...collectionResults);
    if (schema) {
      schemas.set(collectionName, schema);
    }
  }

  const apps = getProtoApps(basePath);
  for (const appName of apps) {
    const appResults = await checkApp(basePath, appName, schemas);
    results.push(...appResults);
  }

  // Print results and terminate.
  let hasFailures = false;
  for (const result of results) {
    if (result.success) {
      Log.pass(result.target);
    } else {
      hasFailures = true;
      Log.fail(result.target);
      for (const error of result.errors ?? []) {
        Log.fail(error, 1);
      }
    }
  }
  if (hasFailures) {
    process.exit(1);
  }
}
