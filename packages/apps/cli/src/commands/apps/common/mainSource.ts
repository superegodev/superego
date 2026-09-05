import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { TargetCollection } from "./types.js";

export function readMainSource(path: string): string {
  const mainPath = join(path, "main.tsx");
  if (!existsSync(mainPath)) {
    throw new Error("main.tsx is missing.");
  }
  return readFileSync(mainPath, "utf-8");
}

export function getInitialMainSource(collections: TargetCollection[]): string {
  const imports = collections.map(
    (collection) =>
      `import type * as ${collection.id} from "./${collection.id}.js";`,
  );
  const collectionFields =
    collections.length === 0
      ? "    Record<string, never>;"
      : [
          "    {",
          ...collections.map((collection) =>
            [
              `      ${collection.id}: {`,
              `        id: "${collection.id}";`,
              "        versionId: string;",
              "        displayName: string;",
              "        documents: {",
              "          id: string;",
              "          versionId: string;",
              "          href: string;",
              `          content: ${collection.id}.${collection.version.schema.rootType};`,
              "        }[];",
              "      };",
            ].join("\n"),
          ),
          "    };",
        ].join("\n");

  return [
    "// Permissions are edited in app.json or the app editor, then saved as a new version.",
    "// Declare state source files to use useAppState/useUpdateAppState; app-state.ts is generated.",
    "// useHttpRequest requires an allowed destination. A URL in state grants no permission.",
    "// See .agents/skills/writing-superego-apps/SKILL.md for the full flow and preview limits.",
    'import React from "react";',
    'import { DefaultApp } from "@superego/app-sandbox/components";',
    ...imports,
    "",
    "interface Props {",
    "  collections:",
    collectionFields,
    "}",
    "",
    "export default function App(props: Props): React.ReactElement | null {",
    "  return <DefaultApp {...props} />;",
    "}",
    "",
  ].join("\n");
}
