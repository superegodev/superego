import sandboxTypescriptLibs from "@superego/app-sandbox/typescript-libs";
import type { Collection, TypescriptFile } from "@superego/backend";
import { codegen } from "@superego/schema";
import { useMemo } from "react";

export default function useTypescriptLibs(targetCollections: Collection[]) {
  const typescriptLibs = useMemo<TypescriptFile[]>(
    () => [
      ...sandboxTypescriptLibs,
      ...targetCollections.map((targetCollection) => ({
        path: `/${targetCollection.id}.ts` as const,
        source: [
          `// Collection ID: ${targetCollection.id}`,
          `// Collection Version ID: ${targetCollection.latestVersion.id}`,
          "",
          codegen(targetCollection.latestVersion.schema),
        ].join("\n"),
      })),
    ],
    [targetCollections],
  );
  return typescriptLibs;
}
