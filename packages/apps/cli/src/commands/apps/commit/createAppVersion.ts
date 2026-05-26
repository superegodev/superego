import type { App, TypescriptModule } from "@superego/backend";
import type { CliBackend } from "../common/commandUtils.js";
import type { AppManifest } from "../common/types.js";

export default async function createAppVersion({
  backend,
  app,
  manifest,
  mainModule,
}: {
  backend: CliBackend;
  app: App;
  manifest: AppManifest;
  mainModule: TypescriptModule;
}): Promise<App> {
  const result = await backend.apps.createNewVersion(
    app.id,
    manifest.targetCollectionIds,
    { "/main.tsx": mainModule },
  );
  if (!result.success) {
    throw new Error(JSON.stringify(result.error));
  }
  return result.data;
}
