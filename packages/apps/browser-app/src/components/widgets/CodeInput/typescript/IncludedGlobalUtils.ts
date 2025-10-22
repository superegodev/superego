import type { TypescriptFile } from "@superego/backend";
import LocalInstantDeclaration from "@superego/javascript-sandbox-global-utils/LocalInstant.d.ts?raw";

export default interface IncludedGlobalUtils {
  LocalInstant: boolean;
}

export function getGlobalUtilsTypescriptLibs(
  includedGlobalUtils?: IncludedGlobalUtils,
): TypescriptFile[] {
  const libs: TypescriptFile[] = [];
  if (includedGlobalUtils?.LocalInstant) {
    libs.push({ source: LocalInstantDeclaration, path: "/LocalInstant.d.ts" });
  }
  return libs;
}
