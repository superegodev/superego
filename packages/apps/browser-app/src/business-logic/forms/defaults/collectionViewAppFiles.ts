import type { Collection } from "@superego/backend";
import { COMPILATION_REQUIRED } from "../constants.js";
import type { RHFAppVersionFiles } from "../utils/RHFAppVersionFiles.js";

export default function collectionViewAppFiles(
  targetCollections: Collection[],
  isImplementationTemplate: boolean,
): RHFAppVersionFiles {
  const code = isImplementationTemplate
    ? '  throw new Error("Not implemented")'
    : // TODO: define a Sandbox component for this
      [
        "  // Default app. Remove when implementing the real one.",
        "  return null;",
      ].join("\n");

  return {
    "/main__DOT__tsx": {
      source: `
import React from "react";
${targetCollections.map(makeCollectionImport).join("\n")}

interface Props {
  collections: {
${indent(targetCollections.map(makeCollectionPropSnippet).join("\n"), 2)}
  };
}
export default function App({ collections }: Props): React.ReactElement | null {
  console.log(collections);
${code}
}
      `.trim(),
      // TODO: give a compiled version for first render
      compiled: COMPILATION_REQUIRED,
    },
  };
}

function makeCollectionPropSnippet(collection: Collection): string {
  return `
${makeCollectionTsDoc(collection)}
${collection.id}: {
  id: "${collection.id}";
  name: string;
  /** If not null, a single emoji. */
  icon: string | null;
  documents: {
    id: \`Document_\${string}\`;
    content: ${collection.id}.${collection.latestVersion.schema.rootType};
  }[];
};
  `.trim();
}

function makeCollectionTsDoc(collection: Collection): string {
  const sanitizedDescription = collection.settings.description?.replaceAll(
    "*/",
    "*\\/",
  );
  const descriptionDoc = sanitizedDescription
    ?.split("\n")
    .map((line) => (line !== "" ? ` * ${line}` : " *"));
  return `
/**
 * ${JSON.stringify(collection.settings.name)} collection.
 *
${descriptionDoc}
 */
  `.trim();
}

function makeCollectionImport(collection: Collection): string {
  return `import type * as ${collection.id} from "./${collection.id}.js";`;
}

function indent(codeBlock: string, levels = 1): string {
  return codeBlock
    .split("\n")
    .map((line) => (line !== "" ? `${"  ".repeat(levels)}${line}` : line))
    .join("\n");
}
