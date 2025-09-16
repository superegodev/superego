import { useEffect } from "react";
import monaco from "../../../../monaco.js";
import type IncludedGlobalUtils from "./IncludedGlobalUtils.js";
import { getGlobalUtilsTypescriptLibs } from "./IncludedGlobalUtils.js";
import type TypescriptLib from "./TypescriptLib.js";

/*
 * Creates models for typescriptLibs when the component is shown, keeps them in
 * sync, and removes them afterwards.
 */
export default function useSyncTypescriptLibsModels(
  editorBasePath: string,
  typescriptLibs: TypescriptLib[] | undefined,
  includedGlobalUtils: IncludedGlobalUtils | undefined,
) {
  useEffect(() => {
    if (typescriptLibs) {
      const libModels = [
        ...(typescriptLibs ?? []),
        ...getGlobalUtilsTypescriptLibs(includedGlobalUtils),
      ].map(({ path, source }) =>
        monaco.editor.createModel(
          source,
          "typescript",
          monaco.Uri.parse(`${editorBasePath}${path}`),
        ),
      );
      // WORKAROUND: It seems that for some reason monaco's TypeScript worker
      // caches old models even when they have been disposed, so when libs
      // update (for example when the code generated from a schema changes) the
      // editor sees the change (i.e., you see the code of the new version of
      // the lib), but the TypeScript worker doesn't (so you get compilation
      // errors). Making a trivial change to compiler options seems to be enough
      // to bust the cache.
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
        // Thankfully we can pass in arbitrary options, so we don't have to
        // touch a "real" option.
        cacheBuster: crypto.randomUUID(),
      });
      return () => {
        for (const libModel of libModels) {
          libModel.dispose();
        }
      };
    }
    return undefined;
  }, [typescriptLibs, includedGlobalUtils, editorBasePath]);
}
