import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { TypescriptFile } from "@superego/backend";
import type { Schema } from "@superego/schema";
import {
  codegen,
  valibotSchemas as schemaValibotSchemas,
} from "@superego/schema";
import { valibotSchemas as sharedValibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";
import appSettingsSchema from "../shared/appSettingsSchema.js";
import collectionSettingsSchema from "../shared/collectionSettingsSchema.js";
import compileTypescriptFile from "../shared/compileTypescriptFile.js";
import discoverProtoApps from "../shared/discoverProtoApps.js";
import discoverProtoCollections from "../shared/discoverProtoCollections.js";
import Log from "../shared/log.js";
import readJsonFile from "../shared/readJsonFile.js";

interface CheckResult {
  label: string;
  success: boolean;
  errors?: string[];
}

function checkJsonValidation(
  label: string,
  filePath: string,
  schema: v.GenericSchema<any, any>,
): CheckResult {
  if (!existsSync(filePath)) {
    return { label, success: false, errors: ["File not found"] };
  }
  let data: unknown;
  try {
    data = readJsonFile(filePath);
  } catch {
    return { label, success: false, errors: ["Invalid JSON"] };
  }
  const result = v.safeParse(schema, data);
  if (result.success) {
    return { label, success: true };
  }
  return {
    label,
    success: false,
    errors: result.issues.map((issue) => issue.message),
  };
}

function checkTestDocuments(
  label: string,
  filePath: string,
  schema: Schema,
): CheckResult {
  let data: unknown;
  try {
    data = readJsonFile(filePath);
  } catch {
    return { label, success: false, errors: ["Invalid JSON"] };
  }
  if (!Array.isArray(data)) {
    return {
      label,
      success: false,
      errors: ["Expected an array of documents"],
    };
  }
  const errors: string[] = [];
  const contentSchema = schemaValibotSchemas.content(schema, "normal");
  for (let i = 0; i < data.length; i++) {
    const result = v.safeParse(contentSchema, data[i]);
    if (!result.success) {
      errors.push(
        `Document [${i}]: ${result.issues.map((issue) => issue.message).join("; ")}`,
      );
    }
  }
  return errors.length === 0
    ? { label, success: true }
    : { label, success: false, errors };
}

async function checkTypescriptCompilation(
  label: string,
  filePath: string,
  mainVirtualPath: `/${string}.ts` | `/${string}.tsx`,
  additionalLibs: TypescriptFile[],
): Promise<CheckResult> {
  const source = readFileSync(filePath, "utf-8");
  const mainFile: TypescriptFile = {
    path: mainVirtualPath,
    source,
  };
  const result = await compileTypescriptFile(mainFile, additionalLibs);
  return result.success
    ? { label, success: true }
    : { label, success: false, errors: [result.errors] };
}

export default async function checkAction(): Promise<void> {
  const basePath = resolve(process.cwd());
  const results: CheckResult[] = [];

  const collections = discoverProtoCollections(basePath);
  const parsedSchemas = new Map<string, Schema>();

  // Check collections
  for (const collectionName of collections) {
    const collectionDir = join(basePath, collectionName);

    // 1. settings.json
    results.push(
      checkJsonValidation(
        `${collectionName}/settings.json`,
        join(collectionDir, "settings.json"),
        collectionSettingsSchema(),
      ),
    );

    // 2. schema.json
    const schemaResult = checkJsonValidation(
      `${collectionName}/schema.json`,
      join(collectionDir, "schema.json"),
      schemaValibotSchemas.schema(),
    );
    results.push(schemaResult);

    if (!schemaResult.success) {
      continue;
    }

    const schemaJson = readJsonFile(join(collectionDir, "schema.json"));
    const parsedSchema = v.parse(schemaValibotSchemas.schema(), schemaJson);
    parsedSchemas.set(collectionName, parsedSchema);

    // 3. defaultDocumentViewUiOptions.json (optional)
    const uiOptionsPath = join(
      collectionDir,
      "defaultDocumentViewUiOptions.json",
    );
    if (existsSync(uiOptionsPath)) {
      results.push(
        checkJsonValidation(
          `${collectionName}/defaultDocumentViewUiOptions.json`,
          uiOptionsPath,
          sharedValibotSchemas.defaultDocumentViewUiOptions(parsedSchema),
        ),
      );
    }

    // 4. test-documents.json (optional)
    const testDocsPath = join(collectionDir, "test-documents.json");
    if (existsSync(testDocsPath)) {
      results.push(
        checkTestDocuments(
          `${collectionName}/test-documents.json`,
          testDocsPath,
          parsedSchema,
        ),
      );
    }

    const generatedTypes = codegen(parsedSchema);
    const generatedLib: TypescriptFile = {
      path: `/generated/${collectionName}.ts`,
      source: generatedTypes,
    };

    // 5. contentSummaryGetter.ts
    const csgPath = join(collectionDir, "contentSummaryGetter.ts");
    if (existsSync(csgPath)) {
      results.push(
        await checkTypescriptCompilation(
          `${collectionName}/contentSummaryGetter.ts`,
          csgPath,
          `/${collectionName}/contentSummaryGetter.ts`,
          [generatedLib],
        ),
      );
    } else {
      results.push({
        label: `${collectionName}/contentSummaryGetter.ts`,
        success: false,
        errors: ["File not found"],
      });
    }

    // 6. contentBlockingKeysGetter.ts (optional)
    const cbkgPath = join(collectionDir, "contentBlockingKeysGetter.ts");
    if (existsSync(cbkgPath)) {
      results.push(
        await checkTypescriptCompilation(
          `${collectionName}/contentBlockingKeysGetter.ts`,
          cbkgPath,
          `/${collectionName}/contentBlockingKeysGetter.ts`,
          [generatedLib],
        ),
      );
    }
  }

  // Check apps
  const apps = discoverProtoApps(basePath);
  for (const appName of apps) {
    const appDir = join(basePath, appName);

    // 7. settings.json
    results.push(
      checkJsonValidation(
        `${appName}/settings.json`,
        join(appDir, "settings.json"),
        appSettingsSchema(),
      ),
    );

    // 8. main.tsx
    const mainTsxPath = join(appDir, "main.tsx");
    if (existsSync(mainTsxPath)) {
      const additionalLibs: TypescriptFile[] = [];
      for (const [collectionName, schema] of parsedSchemas) {
        additionalLibs.push({
          path: `/generated/${collectionName}.ts`,
          source: codegen(schema),
        });
      }
      results.push(
        await checkTypescriptCompilation(
          `${appName}/main.tsx`,
          mainTsxPath,
          `/${appName}/main.tsx`,
          additionalLibs,
        ),
      );
    } else {
      results.push({
        label: `${appName}/main.tsx`,
        success: false,
        errors: ["File not found"],
      });
    }
  }

  // Print results
  let hasFailures = false;
  for (const result of results) {
    if (result.success) {
      Log.info(`PASS  ${result.label}`);
    } else {
      hasFailures = true;
      Log.error(`FAIL  ${result.label}`);
      for (const error of result.errors ?? []) {
        Log.error(`      ${error}`);
      }
    }
  }

  if (hasFailures) {
    process.exit(1);
  } else {
    Log.info("All checks passed.");
  }
}
