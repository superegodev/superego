import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
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
import * as v from "valibot";
import appSettingsSchema from "../shared/appSettingsSchema.js";
import collectionSettingsSchema from "../shared/collectionSettingsSchema.js";
import compileTypescriptFile from "../shared/compileTypescriptFile.js";
import discoverProtoApps from "../shared/discoverProtoApps.js";
import discoverProtoCollections from "../shared/discoverProtoCollections.js";
import Log from "../shared/log.js";
import readJsonFile from "../shared/readJsonFile.js";

function fail(message: string): never {
  Log.error(message);
  process.exit(1);
}

async function compileToModule(
  label: string,
  filePath: string,
  mainVirtualPath: `/${string}.ts` | `/${string}.tsx`,
  additionalLibs: TypescriptFile[],
): Promise<TypescriptModule> {
  const source = readFileSync(filePath, "utf-8");
  const result = await compileTypescriptFile(
    { path: mainVirtualPath, source },
    additionalLibs,
  );
  if (!result.success) {
    fail(`Failed to compile ${label}:\n${result.errors}`);
  }
  return { source, compiled: result.compiled };
}

export default async function compilePack(basePath: string): Promise<Pack> {
  const collections: CollectionDefinition<true, true>[] = [];
  const apps: AppDefinition<true>[] = [];
  const documents: DocumentDefinition<true>[] = [];
  const generatedLibs: TypescriptFile[] = [];

  // Collections
  const collectionNames = discoverProtoCollections(basePath);
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
      fail(
        `${collectionName}/settings.json validation failed:\n${settingsResult.issues.map((i) => i.message).join("\n")}`,
      );
    }
    const settings = settingsResult.output;

    // schema.json
    const schemaPath = join(collectionDir, "schema.json");
    const schemaData = readJsonFile(schemaPath);
    const schemaResult = v.safeParse(schemaValibotSchemas.schema(), schemaData);
    if (!schemaResult.success) {
      fail(
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
    const csgPath = join(collectionDir, "contentSummaryGetter.ts");
    if (!existsSync(csgPath)) {
      fail(`${collectionName}/contentSummaryGetter.ts not found`);
    }
    const contentSummaryGetter = await compileToModule(
      `${collectionName}/contentSummaryGetter.ts`,
      csgPath,
      `/${collectionName}/contentSummaryGetter.ts`,
      [generatedLib],
    );

    // contentBlockingKeysGetter.ts (optional)
    let contentBlockingKeysGetter: TypescriptModule | null = null;
    const cbkgPath = join(collectionDir, "contentBlockingKeysGetter.ts");
    if (existsSync(cbkgPath)) {
      contentBlockingKeysGetter = await compileToModule(
        `${collectionName}/contentBlockingKeysGetter.ts`,
        cbkgPath,
        `/${collectionName}/contentBlockingKeysGetter.ts`,
        [generatedLib],
      );
    }

    // defaultDocumentViewUiOptions.json (optional)
    let defaultDocumentViewUiOptions = null;
    const uiOptionsPath = join(
      collectionDir,
      "defaultDocumentViewUiOptions.json",
    );
    if (existsSync(uiOptionsPath)) {
      const uiOptionsData = readJsonFile(uiOptionsPath);
      const uiOptionsResult = v.safeParse(
        sharedValibotSchemas.defaultDocumentViewUiOptions(schema),
        uiOptionsData,
      );
      if (!uiOptionsResult.success) {
        fail(
          `${collectionName}/defaultDocumentViewUiOptions.json validation failed:\n${uiOptionsResult.issues.map((i) => i.message).join("\n")}`,
        );
      }
      defaultDocumentViewUiOptions = uiOptionsResult.output;
    }

    // test-documents.json (optional)
    const testDocsPath = join(collectionDir, "test-documents.json");
    if (existsSync(testDocsPath)) {
      const testDocsData = readJsonFile(testDocsPath);
      if (!Array.isArray(testDocsData)) {
        fail(
          `${collectionName}/test-documents.json: expected an array of documents`,
        );
      }
      const contentSchema = schemaValibotSchemas.content(schema, "normal");
      for (let i = 0; i < testDocsData.length; i++) {
        const docResult = v.safeParse(contentSchema, testDocsData[i]);
        if (!docResult.success) {
          fail(
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
  const appNames = discoverProtoApps(basePath);
  for (const appName of appNames) {
    const appDir = join(basePath, appName);

    // settings.json
    const settingsPath = join(appDir, "settings.json");
    const settingsData = readJsonFile(settingsPath);
    const settingsResult = v.safeParse(appSettingsSchema(), settingsData);
    if (!settingsResult.success) {
      fail(
        `${appName}/settings.json validation failed:\n${settingsResult.issues.map((i) => i.message).join("\n")}`,
      );
    }
    const settings = settingsResult.output;

    // main.tsx (required)
    const mainTsxPath = join(appDir, "main.tsx");
    if (!existsSync(mainTsxPath)) {
      fail(`${appName}/main.tsx not found`);
    }
    const mainModule = await compileToModule(
      `${appName}/main.tsx`,
      mainTsxPath,
      `/${appName}/main.tsx`,
      generatedLibs,
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
