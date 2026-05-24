import type { App, TypescriptModule } from "@superego/backend";
import type { CliBackend } from "../common/commandUtils.js";
import type { AppLock, AppManifest } from "../common/types.js";

export interface CommitContext {
  backend: CliBackend;
  path: string;
  manifest: AppManifest;
}

export interface ExistingAppCommitContext extends CommitContext {
  lock: AppLock;
}

export interface AppChanges {
  sourceChanged: boolean;
  targetCollectionsChanged: boolean;
  mainModule: TypescriptModule | null;
}

export interface CommitResult {
  operations: string[];
  appId: App["id"];
}
