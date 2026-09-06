import type { App, AppHttpRequest } from "@superego/backend";
import { appHttpFailure } from "@superego/shared-utils";
import { useMemo } from "react";
import useBackend from "../backend/useBackend.js";
import { electronMainWorld } from "../electron/electron.js";
import createPreviewState from "./createPreviewState.js";
import executeBrowserHttpRequest from "./executeBrowserHttpRequest.js";

export default function useAppBackend(app: App, preview: boolean) {
  const backend = useBackend();
  const previewState = useMemo(
    () => createPreviewState(app.latestVersion.state, app.latestVersion.id),
    [app.latestVersion.state, app.latestVersion.id],
  );
  return {
    state: preview
      ? previewState
      : {
          get: () =>
            backend.apps.getState(
              app.id,
              app.latestVersion.id,
              app.latestVersion.stateSchemaId ?? null,
            ),
          update: (
            expectedRevision: number,
            content: Record<string, unknown>,
          ) =>
            backend.apps.updateState(
              app.id,
              app.latestVersion.id,
              app.latestVersion.stateSchemaId ?? null,
              expectedRevision,
              content,
            ),
        },
    http: {
      request: async (request: AppHttpRequest) => {
        if (preview) {
          return appHttpFailure("UnsupportedRuntime");
        }
        const allowedOrigins =
          app.latestVersion.permissions?.http?.allowedOrigins ?? [];
        return electronMainWorld.isElectron
          ? electronMainWorld.appHttp.request(request, allowedOrigins)
          : executeBrowserHttpRequest(request, allowedOrigins);
      },
    },
  };
}
