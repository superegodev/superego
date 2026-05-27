import typescriptLibs from "@superego/app-sandbox/typescript-libs";
import type {
  CollectionId,
  CollectionVersion,
  TypescriptFile,
  TypescriptModule,
} from "@superego/backend";
import { codegen } from "@superego/schema";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import { readMainSource } from "./mainSource.js";
import type { TargetCollection } from "./types.js";

export async function compileApp(
  path: string,
  targetCollections: TargetCollection[],
): Promise<TypescriptModule> {
  const source = readMainSource(path);
  const result = await new TscTypescriptCompiler().compile(
    { path: "/main.tsx", source },
    [...typescriptLibs, ...getCollectionTypescriptLibs(targetCollections)],
  );
  if (!result.success) {
    if (result.error.name === "TypescriptCompilationFailed") {
      throw new Error(
        result.error.details.reason === "TypeErrors"
          ? result.error.details.errors
          : "Missing output after compilation",
      );
    }
    throw new Error(JSON.stringify(result.error.details));
  }
  return source;
}

export function getCollectionTypescriptLibs(
  targetCollections: TargetCollection[],
): TypescriptFile[] {
  return targetCollections.map((targetCollection) => ({
    path: `/${targetCollection.id}.ts` as const,
    source: getCollectionTypescriptSource(
      targetCollection.id,
      targetCollection.version,
    ),
  }));
}

export function getCollectionTypescriptSource(
  id: CollectionId,
  version: CollectionVersion,
): string {
  return [
    `// Collection ID: ${id}`,
    `// Collection Version ID: ${version.id}`,
    "",
    codegen(version.schema),
  ].join("\n");
}
