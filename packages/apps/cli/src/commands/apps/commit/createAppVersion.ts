import type { App, TypescriptModule } from "@superego/backend";
import type { CliBackend } from "../common/commandUtils.js";
import { compileState } from "../common/state.js";
import type { AppManifest } from "../common/types.js";

export default async function createAppVersion({
  backend,
  app,
  manifest,
  mainModule,
  path,
}: {
  backend: CliBackend;
  app: App;
  manifest: AppManifest;
  mainModule: TypescriptModule;
  path: string;
}): Promise<App> {
  const result = await backend.apps.createNewVersion(
    app.id,
    app.latestVersion.id,
    manifest.targetCollectionIds,
    { "/main.tsx": mainModule },
    manifest.permissions,
    await compileState(path),
  );
  if (!result.success) {
    throw new Error(JSON.stringify(result.error));
  }
  return result.data;
}
