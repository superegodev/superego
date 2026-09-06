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
  stateChanged,
}: {
  backend: CliBackend;
  app: App;
  manifest: AppManifest;
  mainModule: TypescriptModule;
  path: string;
  stateChanged: boolean;
}): Promise<App> {
  const result = await backend.apps.createNewVersion(
    app.id,
    app.latestVersion.id,
    manifest.targetCollectionIds,
    { "/main.tsx": mainModule },
    {
      permissions: manifest.permissions ?? {},
      state: stateChanged ? await compileState(path) : undefined,
    },
  );
  if (!result.success) {
    throw new Error(JSON.stringify(result.error));
  }
  return result.data;
}
