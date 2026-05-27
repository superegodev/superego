import appTypescriptLibs from "@superego/app-sandbox/typescript-libs";
import {
  type TypescriptCompilationFailed,
  type TypescriptFile,
  type TypescriptModule,
  type UnexpectedError,
  type ValidationIssue,
} from "@superego/backend";
import type { Result } from "@superego/global-types";
import { codegen, type Schema } from "@superego/schema";
import { makeSuccessfulResult } from "@superego/shared-utils";
import LocalInstantTypeDeclaration from "@superego/typescript-sandbox-global-utils/LocalInstant.d.ts?raw";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import type TypescriptCompiler from "../requirements/TypescriptCompiler.js";
import type TypescriptSandbox from "../requirements/TypescriptSandbox.js";

export function getCollectionGetterTypescriptLibs(
  schema: Schema,
): TypescriptFile[] {
  return [
    { path: "/CollectionSchema.ts", source: codegen(schema) },
    { path: "/LocalInstant.d.ts", source: LocalInstantTypeDeclaration },
  ];
}

export function getCollectionMigrationTypescriptLibs(
  previousSchema: Schema,
  nextSchema: Schema,
): TypescriptFile[] {
  return [
    { path: "/PreviousCollectionSchema.ts", source: codegen(previousSchema) },
    { path: "/NextCollectionSchema.ts", source: codegen(nextSchema) },
    { path: "/LocalInstant.d.ts", source: LocalInstantTypeDeclaration },
  ];
}

export function getAppTypescriptLibs(
  targetCollections: Pick<CollectionVersionEntity, "collectionId" | "schema">[],
): TypescriptFile[] {
  return [
    ...appTypescriptLibs,
    ...targetCollections.map((targetCollection) => ({
      path: `/${targetCollection.collectionId}.ts` as const,
      source: codegen(targetCollection.schema),
    })),
  ];
}

export async function compileTypescriptModule(
  typescriptCompiler: TypescriptCompiler,
  module: TypescriptModule,
  path: TypescriptFile["path"],
  libs: TypescriptFile[],
): Promise<Result<string, TypescriptCompilationFailed | UnexpectedError>> {
  return typescriptCompiler.compile({ path, source: module }, libs);
}

export async function validateTypescriptModuleDefaultExportsFunction(
  typescriptCompiler: TypescriptCompiler,
  typescriptSandbox: TypescriptSandbox,
  module: TypescriptModule,
  path: TypescriptFile["path"],
  libs: TypescriptFile[],
  defaultExportIssueMessage: string,
): Promise<Result<null, UnexpectedError> | { issues: ValidationIssue[] }> {
  const compileResult = await compileTypescriptModule(
    typescriptCompiler,
    module,
    path,
    libs,
  );
  if (!compileResult.success) {
    if (compileResult.error.name === "UnexpectedError") {
      return { success: false, data: null, error: compileResult.error };
    }
    return {
      issues: [
        {
          message:
            compileResult.error.details.reason === "TypeErrors"
              ? compileResult.error.details.errors
              : "Missing output after TypeScript compilation",
        },
      ],
    };
  }

  if (!(await typescriptSandbox.moduleDefaultExportsFunction(module))) {
    return { issues: [{ message: defaultExportIssueMessage }] };
  }

  return makeSuccessfulResult(null);
}
