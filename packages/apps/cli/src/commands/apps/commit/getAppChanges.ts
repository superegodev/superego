import type { App } from "@superego/backend";
import {
  type CliBackend,
  resolveLatestTargetCollections,
  sameArray,
} from "../common/commandUtils.js";
import { compileApp } from "../common/compile.js";
import { readMainSource } from "../common/mainSource.js";
import type { AppManifest } from "../common/types.js";
import getTargetCollectionIds from "./getTargetCollectionIds.js";
import type { AppChanges } from "./types.js";

export default async function getAppChanges({
  backend,
  path,
  manifest,
  app,
}: {
  backend: CliBackend;
  path: string;
  manifest: AppManifest;
  app: App;
}): Promise<AppChanges> {
  const targetCollectionIds = getTargetCollectionIds(app);
  const source = readMainSource(path);
  const sourceChanged = source !== app.latestVersion.files["/main.tsx"].source;
  const targetCollectionsChanged = !sameArray(
    manifest.targetCollectionIds,
    targetCollectionIds,
  );
  const mainModule =
    sourceChanged || targetCollectionsChanged
      ? await compileApp(
          path,
          await resolveLatestTargetCollections(
            backend,
            manifest.targetCollectionIds,
          ),
        )
      : null;

  return { sourceChanged, targetCollectionsChanged, mainModule };
}
