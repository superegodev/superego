import type { App } from "@superego/backend";
import { useMemo } from "react";
import useBackend from "../backend/useBackend.js";
import createPreviewState from "./createPreviewState.js";

export default function useAppBackend(app: App, preview: boolean) {
  const backend = useBackend();
  const previewState = useMemo(
    () => createPreviewState(app.id, app.latestVersion.state),
    [app.id, app.latestVersion.state],
  );
  return {
    state: preview
      ? previewState
      : {
          get: () => backend.apps.getState(app.id, app.latestVersion.id),
          update: (
            expectedRevision: number,
            content: Record<string, unknown>,
          ) =>
            backend.apps.updateState(
              app.id,
              app.latestVersion.id,
              expectedRevision,
              content,
            ),
        },
  };
}
