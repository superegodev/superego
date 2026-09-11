import { compileApp } from "../common/compile.js";
import { regenerateGeneratedFiles } from "../common/generatedFiles.js";
import { compileStateDefinition } from "../common/stateDefinition.js";
import type { TargetCollection } from "../common/types.js";

export default async function checkApp(
  path: string,
  targetCollections: TargetCollection[],
): Promise<void> {
  await regenerateGeneratedFiles(path, targetCollections);
  await compileApp(path, targetCollections);
  await compileStateDefinition(path);
}
