import type { App } from "@superego/backend";
import { useMemo } from "react";
import useBackend from "../backend/useBackend.js";
import createPreviewState from "./createPreviewState.js";

export default function useAppBackend(app: App, preview: boolean) {
  const backend = useBackend();
  const previewState = useMemo(
    () => createPreviewState(app.id, app.latestVersion.stateDefinition),
    [app.id, app.latestVersion.stateDefinition],
  );
  return {
    state: preview
      ? previewState
      : {
          get: () => backend.apps.getState(app.id, app.latestVersion.id),
          update: (latestRevision: number, content: any) =>
            backend.apps.updateState(
              app.id,
              app.latestVersion.id,
              latestRevision,
              content,
            ),
        },
  };
}
