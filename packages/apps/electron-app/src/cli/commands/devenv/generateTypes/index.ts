import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { codegen, valibotSchemas } from "@superego/schema";
import * as v from "valibot";
import discoverProtoCollections from "../shared/discoverProtoCollections.js";
import Log from "../shared/log.js";
import readJsonFile from "../shared/readJsonFile.js";

export default async function generateTypesAction(): Promise<void> {
  const basePath = resolve(process.cwd());
  const collections = discoverProtoCollections(basePath);

  if (collections.length === 0) {
    Log.warning("No ProtoCollection_* directories found.");
    return;
  }

  let hasErrors = false;

  for (const collectionName of collections) {
    const schemaPath = join(basePath, collectionName, "schema.json");
    if (!existsSync(schemaPath)) {
      Log.error(`FAIL  ${collectionName}/schema.json not found`);
      hasErrors = true;
      continue;
    }

    let schemaJson: unknown;
    try {
      schemaJson = readJsonFile(schemaPath);
    } catch {
      Log.error(`FAIL  ${collectionName}/schema.json is not valid JSON`);
      hasErrors = true;
      continue;
    }

    const parseResult = v.safeParse(valibotSchemas.schema(), schemaJson);
    if (!parseResult.success) {
      Log.error(
        `FAIL  ${collectionName}/schema.json is not a valid schema:`,
      );
      for (const issue of parseResult.issues) {
        Log.error(`      ${issue.message}`);
      }
      hasErrors = true;
      continue;
    }

    const generated = codegen(parseResult.output);
    const generatedDir = join(basePath, "generated");
    mkdirSync(generatedDir, { recursive: true });
    writeFileSync(join(generatedDir, `${collectionName}.ts`), generated);
    Log.info(`PASS  generated/${collectionName}.ts`);
  }

  if (hasErrors) {
    process.exit(1);
  }
}
