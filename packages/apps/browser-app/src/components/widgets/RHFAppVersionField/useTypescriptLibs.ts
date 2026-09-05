import sandboxTypescriptLibs from "@superego/app-sandbox/typescript-libs";
import type { Collection, TypescriptFile } from "@superego/backend";
import { type Schema } from "@superego/schema";
import { codegen } from "@superego/schema";
import { appStateSchema } from "@superego/shared-utils";
import { useMemo } from "react";
import * as v from "valibot";

export default function useTypescriptLibs(
  targetCollections: Collection[],
  stateSchema?: Schema,
) {
  const typescriptLibs = useMemo<TypescriptFile[]>(
    () => [
      ...sandboxTypescriptLibs,
      ...(stateSchema && v.safeParse(appStateSchema(), stateSchema).success
        ? [{ path: "/app-state.ts" as const, source: codegen(stateSchema) }]
        : []),
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
    [targetCollections, stateSchema],
  );
  return typescriptLibs;
}
