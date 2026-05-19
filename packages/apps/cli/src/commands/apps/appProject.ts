export { assertEmptyTarget } from "./appProject/target.js";
export { buildLock, readLock, writeLock } from "./appProject/lock.js";
export { compileApp } from "./appProject/compile.js";
export { getInitialMainSource } from "./appProject/scaffold.js";
export { readMainSource } from "./appProject/mainSource.js";
export { readManifest, writeManifest } from "./appProject/manifest.js";
export { regenerateGeneratedFiles } from "./appProject/generatedFiles.js";
export { default as writeAppProject } from "./appProject/writeAppProject.js";
export type {
  AppLock,
  AppManifest,
  TargetCollection,
} from "./appProject/types.js";
