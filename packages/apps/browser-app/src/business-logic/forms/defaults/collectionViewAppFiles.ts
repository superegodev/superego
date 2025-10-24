import type { Collection } from "@superego/backend";
import type { RHFAppVersionFiles } from "../utils/RHFAppVersionFiles.js";

export default function collectionViewAppFiles(
  targetCollections: Collection[],
): RHFAppVersionFiles {
  return {
    "/main__DOT__tsx": {
      source: `
import React from "react";
import { DefaultApp } from "@superego/app-sandbox/components";
${targetCollections.map(makeCollectionImport).join("\n")}

interface Props {
  collections: {
${indent(targetCollections.map(makeCollectionPropSnippet).join("\n"), 2)}
  };
}
export default function App(props: Props): React.ReactElement | null {
  // The DefaultApp component is only a placeholder. Don't include it in the
  // final version of the app.
  return <DefaultApp {...props} />;
}
      `.trim(),
      compiled: `
import React from "react";
import { DefaultApp } from "@superego/app-sandbox/components";

export default function App(props) {
  return React.createElement(DefaultApp, props);
}
      `.trim(),
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
