import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import typescriptLibs from "@superego/app-sandbox/typescript-libs";
import {
  type AppDefinition,
  AppType,
  type CollectionCategoryDefinition,
  type CollectionDefinition,
  type DocumentDefinition,
  type Pack,
  type PackId,
  type ProtoCollectionCategoryId,
  Theme,
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
import appSettingsSchema from "./appSettingsSchema.js";
import collectionSettingsSchema from "./collectionSettingsSchema.js";
import getProtoApps from "./getProtoApps.js";
import getProtoCollections from "./getProtoCollections.js";
import packJsonSchema from "./packJsonSchema.js";
import readJsonFile from "./readJsonFile.js";

export default async function compilePack(
  basePath: string,
  options?: { includeDemoDocuments?: boolean },
): Promise<Pack> {
  const collections: CollectionDefinition<true, true>[] = [];
  const apps: AppDefinition<true>[] = [];
  const documents: DocumentDefinition<true>[] = [];
  const generatedLibs: TypescriptFile[] = [];
  const collectionSchemas = new Map<string, Schema>();

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
    collectionSchemas.set(collectionName, schema);

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

    collections.push({
      settings: {
        name: settings.name,
        icon: settings.icon,
        collectionCategoryId:
          (settings.collectionCategoryId as ProtoCollectionCategoryId | null) ??
          null,
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

  // Demo documents
  if (options?.includeDemoDocuments) {
    const demoDocumentsDir = join(basePath, "demo-documents");
    if (existsSync(demoDocumentsDir)) {
      const demoFiles = readdirSync(demoDocumentsDir)
        .filter((f) => /^ProtoDocument_\d+\.json$/.test(f))
        .sort();
      for (const fileName of demoFiles) {
        const filePath = join(demoDocumentsDir, fileName);
        const data = readJsonFile(filePath);
        if (
          !(
            typeof data === "object" &&
            data !== null &&
            "collectionId" in data &&
            typeof data.collectionId === "string" &&
            "content" in data
          )
        ) {
          throw new Error(
            `demo-documents/${fileName}: expected an object with "collectionId" and "content" fields`,
          );
        }
        const { collectionId, content } = data as {
          collectionId: string;
          content: unknown;
        };
        const schema = collectionSchemas.get(collectionId);
        if (!schema) {
          throw new Error(
            `demo-documents/${fileName}: unknown collectionId "${collectionId}"`,
          );
        }
        const contentSchema = schemaValibotSchemas.content(schema, "normal");
        const docResult = v.safeParse(contentSchema, content);
        if (!docResult.success) {
          throw new Error(
            `demo-documents/${fileName} content validation failed:\n${docResult.issues.map((iss) => iss.message).join("\n")}`,
          );
        }
        documents.push({
          collectionId: collectionId as `ProtoCollection_${number}`,
          content: docResult.output,
        });
      }
    }
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

  // pack.json (optional)
  const packJsonPath = join(basePath, "pack.json");
  if (existsSync(packJsonPath)) {
    const packJsonResult = v.safeParse(
      packJsonSchema(),
      readJsonFile(packJsonPath),
    );
    if (!packJsonResult.success) {
      throw new Error(
        `pack.json validation failed:\n${packJsonResult.issues.map((i) => i.message).join("\n")}`,
      );
    }
    const packJson = packJsonResult.output;

    const screenshotsDir = join(basePath, "screenshots");
    const themeMap: Record<string, Theme.Light | Theme.Dark> = {
      light: Theme.Light,
      dark: Theme.Dark,
    };
    const screenshots = existsSync(screenshotsDir)
      ? readdirSync(screenshotsDir)
          .filter((filename) => !filename.startsWith("."))
          .sort()
          .map((filename) => {
            const content = new Uint8Array(
              readFileSync(join(screenshotsDir, filename)),
            );
            const parts = filename.split(".");
            if (parts.length < 3) {
              throw new Error(
                `screenshots/${filename}: expected format <name>.<light|dark>.<ext>`,
              );
            }
            const themePart = parts[parts.length - 2]!.toLowerCase();
            const theme = themeMap[themePart];
            if (!theme) {
              throw new Error(
                `screenshots/${filename}: unrecognized theme "${themePart}", expected "light" or "dark"`,
              );
            }
            const extension = extname(filename).slice(1).toLowerCase();
            const mimeTypeMap: Record<string, string> = {
              png: "image/png",
              jpg: "image/jpeg",
              jpeg: "image/jpeg",
              avif: "image/avif",
              webp: "image/webp",
            };
            const mimeType = mimeTypeMap[extension] ?? `image/${extension}`;
            return {
              theme,
              mimeType: mimeType as `image/${string}`,
              content,
            };
          })
      : [];

    const collectionCategories: CollectionCategoryDefinition<true>[] =
      packJson.collectionCategories.map((cat) => ({
        name: cat.name,
        icon: cat.icon,
        parentId: cat.parentId as ProtoCollectionCategoryId | null,
      }));

    return {
      id: packJson.id as PackId,
      info: {
        name: packJson.name,
        shortDescription: packJson.shortDescription,
        longDescription: packJson.longDescription,
        screenshots,
      },
      collectionCategories,
      collections,
      apps,
      documents,
    };
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
