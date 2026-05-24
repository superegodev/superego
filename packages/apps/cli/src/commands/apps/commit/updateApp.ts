import { getLockedApp } from "../common/commandUtils.js";
import { buildLock, writeLock } from "../common/lock.js";
import assertCheckoutCurrent from "./assertCheckoutCurrent.js";
import createAppVersion from "./createAppVersion.js";
import getAppChanges from "./getAppChanges.js";
import type { CommitResult, ExistingAppCommitContext } from "./types.js";
import updateAppName from "./updateAppName.js";

export default async function updateApp({
  backend,
  path,
  manifest,
  lock,
}: ExistingAppCommitContext): Promise<CommitResult> {
  let app = await getLockedApp(backend, lock.appId);
  assertCheckoutCurrent(lock, app);

  const changes = await getAppChanges({ backend, path, manifest, app });
  const operations: string[] = [];

  if (manifest.name !== app.name) {
    app = await updateAppName({ backend, app, name: manifest.name });
    operations.push("updated name");
  }

  if (changes.sourceChanged || changes.targetCollectionsChanged) {
    app = await createAppVersion({
      backend,
      app,
      manifest,
      mainModule: changes.mainModule!,
    });
    operations.push("created new version");
  }

  if (operations.length === 0) {
    operations.push("nothing to commit");
  }
  await writeLock(path, buildLock(app));
  return { operations, appId: app.id };
}
