import { existsSync } from "node:fs";
import { join } from "node:path";
import type { TypescriptFile } from "@superego/backend";
import type { Schema } from "@superego/schema";
import {
  codegen,
  valibotSchemas as schemaValibotSchemas,
} from "@superego/schema";
import { valibotSchemas as sharedValibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";
import collectionSettingsSchema from "../utils/collectionSettingsSchema.js";
import readJsonFile from "../utils/readJsonFile.js";
import type CheckResult from "./CheckResult.js";
import checkGeneratedTypes from "./checkGeneratedTypes.js";
import checkJsonValidation from "./checkJsonValidation.js";
import checkTestDocuments from "./checkTestDocuments.js";
import checkTypescriptCompilation from "./checkTypescriptCompilation.js";

export default async function checkCollection(
  basePath: string,
  collectionName: string,
): Promise<{ results: CheckResult[]; schema: Schema | null }> {
  const results: CheckResult[] = [];
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
  const schemaPath = join(collectionDir, "schema.json");
  const schemaResult = checkJsonValidation(
    `${collectionName}/schema.json`,
    schemaPath,
    schemaValibotSchemas.schema(),
  );
  results.push(schemaResult);
  if (!schemaResult.success) {
    return { results, schema: null };
  }
  const schema = readJsonFile(schemaPath);

  // 3. defaultDocumentViewUiOptions.json (optional)
  const defaultDocumentViewUiOptionsPath = join(
    collectionDir,
    "defaultDocumentViewUiOptions.json",
  );
  if (existsSync(defaultDocumentViewUiOptionsPath)) {
    results.push(
      checkJsonValidation(
        `${collectionName}/defaultDocumentViewUiOptions.json`,
        defaultDocumentViewUiOptionsPath,
        sharedValibotSchemas.defaultDocumentViewUiOptions(schema),
      ),
    );
  }

  // 4. test-documents.json (optional)
  const testDocumentsPath = join(collectionDir, "test-documents.json");
  if (existsSync(testDocumentsPath)) {
    results.push(
      checkTestDocuments(
        `${collectionName}/test-documents.json`,
        testDocumentsPath,
        schema,
      ),
    );
  }

  // 5. generated types
  const generatedTypes = codegen(schema);
  results.push(
    checkGeneratedTypes(
      `generated/${collectionName}.ts`,
      join(basePath, "generated", `${collectionName}.ts`),
      generatedTypes,
    ),
  );
  const generatedLib: TypescriptFile = {
    path: `/generated/${collectionName}.ts`,
    source: generatedTypes,
  };

  // 6. contentSummaryGetter.ts
  const contentSummaryGetterPath = join(
    collectionDir,
    "contentSummaryGetter.ts",
  );
  if (existsSync(contentSummaryGetterPath)) {
    results.push(
      await checkTypescriptCompilation(
        `${collectionName}/contentSummaryGetter.ts`,
        contentSummaryGetterPath,
        `/${collectionName}/contentSummaryGetter.ts`,
        [generatedLib],
      ),
    );
  } else {
    results.push({
      target: `${collectionName}/contentSummaryGetter.ts`,
      success: false,
      errors: ["File not found"],
    });
  }

  // 7. contentBlockingKeysGetter.ts (optional)
  const contentBlockingKeysGetterPath = join(
    collectionDir,
    "contentBlockingKeysGetter.ts",
  );
  if (existsSync(contentBlockingKeysGetterPath)) {
    results.push(
      await checkTypescriptCompilation(
        `${collectionName}/contentBlockingKeysGetter.ts`,
        contentBlockingKeysGetterPath,
        `/${collectionName}/contentBlockingKeysGetter.ts`,
        [generatedLib],
      ),
    );
  }

  return { results, schema };
}
