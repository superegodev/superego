import type { Collection } from "@superego/backend";
import { COMPILATION_REQUIRED } from "../constants.js";
import type { RHFAppVersionFiles } from "../utils/RHFAppVersionFiles.js";

export default function collectionViewAppFiles(
  _targetCollections: Collection[],
): RHFAppVersionFiles {
  return {
    "/main__DOT__tsx": {
      source: [
        // `import React from "react";`,
        // "",
        // "interface Props {",
        // "", // TODO: documents for each target collection
        // "}",
        "export default function App () {",
        "  return null;",
        "}",
      ].join("\n"),
      compiled: COMPILATION_REQUIRED,
    },
  };
}
