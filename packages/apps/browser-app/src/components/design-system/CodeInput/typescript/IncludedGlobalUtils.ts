import LocalInstantDeclaration from "@superego/javascript-sandbox-global-utils/LocalInstant.d.ts?raw";
import type TypescriptLib from "./TypescriptLib.js";

export default interface IncludedGlobalUtils {
  LocalInstant: boolean;
}

export function getGlobalUtilsTypescriptLibs(
  includedGlobalUtils?: IncludedGlobalUtils,
): TypescriptLib[] {
  const libs: TypescriptLib[] = [];
  if (includedGlobalUtils?.LocalInstant) {
    libs.push({
      source: LocalInstantDeclaration,
      path: "/LocalInstant.d.ts",
    });
  }
  return libs;
}
