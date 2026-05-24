import type { App } from "@superego/backend";
import type { CliBackend } from "../common/commandUtils.js";

export default async function updateAppName({
  backend,
  app,
  name,
}: {
  backend: CliBackend;
  app: App;
  name: string;
}): Promise<App> {
  const result = await backend.apps.updateName(app.id, name);
  if (!result.success) {
    throw new Error(JSON.stringify(result.error));
  }
  return result.data;
}
