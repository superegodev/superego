import type { App } from "@superego/backend";
import { isEqual } from "es-toolkit";
import {
  type CliBackend,
  resolveLatestTargetCollections,
  sameArray,
} from "../common/commandUtils.js";
import { compileApp } from "../common/compile.js";
import { readMainSource } from "../common/mainSource.js";
import { readStateSource, stateSourceOf } from "../common/state.js";
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
  const permissionsChanged = !isEqual(
    manifest.permissions,
    app.latestVersion.permissions,
  );
  const stateChanged = !isEqual(
    readStateSource(path),
    stateSourceOf(app.latestVersion.state),
  );
  const mainModule =
    sourceChanged ||
    targetCollectionsChanged ||
    permissionsChanged ||
    stateChanged
      ? await compileApp(
          path,
          await resolveLatestTargetCollections(
            backend,
            manifest.targetCollectionIds,
          ),
        )
      : null;

  return {
    sourceChanged,
    targetCollectionsChanged,
    permissionsChanged,
    stateChanged,
    mainModule,
  };
}
