import { existsSync } from "node:fs";
import { join } from "node:path";
import typescriptLibs from "@superego/app-sandbox/typescript-libs";
import type { TypescriptFile } from "@superego/backend";
import type { Schema } from "@superego/schema";
import { codegen } from "@superego/schema";
import appSettingsSchema from "../utils/appSettingsSchema.js";
import type CheckResult from "./CheckResult.js";
import checkJsonValidation from "./checkJsonValidation.js";
import checkTypescriptCompilation from "./checkTypescriptCompilation.js";

export default async function checkApp(
  basePath: string,
  appName: string,
  schemas: Map<string, Schema>,
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const appDir = join(basePath, appName);

  // 1. settings.json
  results.push(
    checkJsonValidation(
      `${appName}/settings.json`,
      join(appDir, "settings.json"),
      appSettingsSchema(),
    ),
  );

  // 2. main.tsx
  const mainTsxPath = join(appDir, "main.tsx");
  if (existsSync(mainTsxPath)) {
    const libs: TypescriptFile[] = [...typescriptLibs];
    for (const [collectionName, schema] of schemas) {
      libs.push({
        path: `/generated/${collectionName}.ts`,
        source: codegen(schema),
      });
    }
    results.push(
      await checkTypescriptCompilation(
        `${appName}/main.tsx`,
        mainTsxPath,
        `/${appName}/main.tsx`,
        libs,
      ),
    );
  } else {
    results.push({
      target: `${appName}/main.tsx`,
      success: false,
      errors: ["File not found"],
    });
  }

  return results;
}
