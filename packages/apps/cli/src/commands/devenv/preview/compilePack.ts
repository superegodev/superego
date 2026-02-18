import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import typescriptLibs from "@superego/app-sandbox/typescript-libs";
import {
  type AppDefinition,
  AppType,
  type CollectionDefinition,
  type DocumentDefinition,
  type Pack,
  type PackId,
  type TypescriptFile,
  type TypescriptModule,
} from "@superego/backend";
import type { Schema } from "@superego/schema";
import {
  codegen,
  valibotSchemas as schemaValibotSchemas,
} from "@superego/schema";
import { valibotSchemas as sharedValibotSchemas } from "@superego/shared-utils";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import * as v from "valibot";
import appSettingsSchema from "../utils/appSettingsSchema.js";
import collectionSettingsSchema from "../utils/collectionSettingsSchema.js";
import getProtoApps from "../utils/getProtoApps.js";
import getProtoCollections from "../utils/getProtoCollections.js";
import readJsonFile from "../utils/readJsonFile.js";

export default async function compilePack(basePath: string): Promise<Pack> {
  const collections: CollectionDefinition<true, true>[] = [];
  const apps: AppDefinition<true>[] = [];
  const documents: DocumentDefinition<true>[] = [];
  const generatedLibs: TypescriptFile[] = [];

  // Collections
  const collectionNames = getProtoCollections(basePath);
  for (const collectionName of collectionNames) {
    const collectionDir = join(basePath, collectionName);

    // settings.json
    const settingsPath = join(collectionDir, "settings.json");
    const settingsData = readJsonFile(settingsPath);
    const settingsResult = v.safeParse(
      collectionSettingsSchema(),
      settingsData,
    );
    if (!settingsResult.success) {
      throw new Error(
        `${collectionName}/settings.json validation failed:\n${settingsResult.issues.map((i) => i.message).join("\n")}`,
      );
    }
    const settings = settingsResult.output;

    // schema.json
    const schemaPath = join(collectionDir, "schema.json");
    const schemaData = readJsonFile(schemaPath);
    const schemaResult = v.safeParse(schemaValibotSchemas.schema(), schemaData);
    if (!schemaResult.success) {
      throw new Error(
        `${collectionName}/schema.json validation failed:\n${schemaResult.issues.map((i) => i.message).join("\n")}`,
      );
    }
    const schema: Schema = schemaResult.output;

    // Generate types for this collection
    const generatedTypes = codegen(schema);
    const generatedLib: TypescriptFile = {
      path: `/generated/${collectionName}.ts`,
      source: generatedTypes,
    };
    generatedLibs.push(generatedLib);

    // contentSummaryGetter.ts (required)
    const contentSummaryGetterPath = join(
      collectionDir,
      "contentSummaryGetter.ts",
    );
    if (!existsSync(contentSummaryGetterPath)) {
      throw new Error(`${collectionName}/contentSummaryGetter.ts not found`);
    }
    const contentSummaryGetter = await compileToModule(
      `${collectionName}/contentSummaryGetter.ts`,
      contentSummaryGetterPath,
      `/${collectionName}/contentSummaryGetter.ts`,
      [generatedLib],
    );

    // contentBlockingKeysGetter.ts (optional)
    let contentBlockingKeysGetter: TypescriptModule | null = null;
    const contentBlockingKeysGetterPath = join(
      collectionDir,
      "contentBlockingKeysGetter.ts",
    );
    if (existsSync(contentBlockingKeysGetterPath)) {
      contentBlockingKeysGetter = await compileToModule(
        `${collectionName}/contentBlockingKeysGetter.ts`,
        contentBlockingKeysGetterPath,
        `/${collectionName}/contentBlockingKeysGetter.ts`,
        [generatedLib],
      );
    }

    // defaultDocumentViewUiOptions.json (optional)
    let defaultDocumentViewUiOptions = null;
    const defaultDocumentViewUiOptionsPath = join(
      collectionDir,
      "defaultDocumentViewUiOptions.json",
    );
    if (existsSync(defaultDocumentViewUiOptionsPath)) {
      const uiOptionsData = readJsonFile(defaultDocumentViewUiOptionsPath);
      const uiOptionsResult = v.safeParse(
        sharedValibotSchemas.defaultDocumentViewUiOptions(schema),
        uiOptionsData,
      );
      if (!uiOptionsResult.success) {
        throw new Error(
          `${collectionName}/defaultDocumentViewUiOptions.json validation failed:\n${uiOptionsResult.issues.map((i) => i.message).join("\n")}`,
        );
      }
      defaultDocumentViewUiOptions = uiOptionsResult.output;
    }

    // test-documents.json (optional)
    const testDocumentsPath = join(collectionDir, "test-documents.json");
    if (existsSync(testDocumentsPath)) {
      const testDocsData = readJsonFile(testDocumentsPath);
      if (!Array.isArray(testDocsData)) {
        throw new Error(
          `${collectionName}/test-documents.json: expected an array of documents`,
        );
      }
      const contentSchema = schemaValibotSchemas.content(schema, "normal");
      for (let i = 0; i < testDocsData.length; i++) {
        const docResult = v.safeParse(contentSchema, testDocsData[i]);
        if (!docResult.success) {
          throw new Error(
            `${collectionName}/test-documents.json[${i}] validation failed:\n${docResult.issues.map((iss) => iss.message).join("\n")}`,
          );
        }
        documents.push({
          collectionId: collectionName as `ProtoCollection_${number}`,
          content: docResult.output,
        });
      }
    }

    collections.push({
      settings: {
        name: settings.name,
        icon: settings.icon,
        collectionCategoryId: null,
        defaultCollectionViewAppId: settings.defaultCollectionViewAppId as
          | `ProtoApp_${string}`
          | null,
        description: settings.description,
        assistantInstructions: settings.assistantInstructions,
      },
      schema,
      versionSettings: {
        contentSummaryGetter,
        contentBlockingKeysGetter,
        defaultDocumentViewUiOptions,
      },
    });
  }

  // Apps
  const appNames = getProtoApps(basePath);
  for (const appName of appNames) {
    const appDir = join(basePath, appName);

    // settings.json
    const settingsPath = join(appDir, "settings.json");
    const settingsData = readJsonFile(settingsPath);
    const settingsResult = v.safeParse(appSettingsSchema(), settingsData);
    if (!settingsResult.success) {
      throw new Error(
        `${appName}/settings.json validation failed:\n${settingsResult.issues.map((i) => i.message).join("\n")}`,
      );
    }
    const settings = settingsResult.output;

    // main.tsx (required)
    const mainTsxPath = join(appDir, "main.tsx");
    if (!existsSync(mainTsxPath)) {
      throw new Error(`${appName}/main.tsx not found`);
    }
    const mainModule = await compileToModule(
      `${appName}/main.tsx`,
      mainTsxPath,
      `/${appName}/main.tsx`,
      [...typescriptLibs, ...generatedLibs],
    );

    apps.push({
      type: AppType.CollectionView,
      name: settings.name,
      targetCollectionIds: settings.targetCollectionIds as any,
      files: { "/main.tsx": mainModule },
    });
  }

  return {
    id: "Pack_devenv-preview" as PackId,
    info: {
      name: "Development Environment Preview",
      shortDescription: "",
      longDescription: "",
      screenshots: [],
    },
    collectionCategories: [],
    collections,
    apps,
    documents,
  };
}

async function compileToModule(
  target: string,
  filePath: string,
  mainVirtualPath: `/${string}.ts` | `/${string}.tsx`,
  additionalLibs: TypescriptFile[],
): Promise<TypescriptModule> {
  const source = readFileSync(filePath, "utf-8");
  const result = await new TscTypescriptCompiler().compile(
    { path: mainVirtualPath, source },
    additionalLibs,
  );
  if (!result.success) {
    throw new Error(
      result.error.name === "TypescriptCompilationFailed"
        ? `Failed to compile ${target}:\n${
            result.error.details.reason === "TypeErrors"
              ? result.error.details.errors
              : "Missing output after compilation"
          }`
        : `Failed to compile ${target}:\nUnexpected error: ${JSON.stringify(result.error.details)}`,
    );
  }
  return {
    // In the devenv environment, generated collection types are imported as
    // ../generated/ProtoCollection_*.js. The superego app expects
    // ./ProtoCollection_*.js. Only the TypeScript source needs rewriting —
    // these are type-only imports, so the compiled JS output doesn't contain
    // them.
    source: source.replaceAll("../generated/", "./"),
    compiled: result.data,
  };
}
