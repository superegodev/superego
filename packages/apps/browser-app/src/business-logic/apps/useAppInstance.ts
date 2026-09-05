import type { App, AppHttpRequest } from "@superego/backend";
import { appHttpFailure } from "@superego/shared-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useBackend from "../backend/useBackend.js";
import { electronMainWorld } from "../electron/electron.js";
import { announceAppChange, subscribeAppChanges } from "./appChanges.js";
import createBrowserHttpInstance from "./createBrowserHttpInstance.js";
import createPreviewState from "./createPreviewState.js";

const backendListeners = new WeakMap<object, Set<() => void>>();

export default function useAppInstance(app: App, preview: boolean) {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const listeners = useMemo(() => {
    if (preview) {
      return new Set<() => void>();
    }
    let listeners = backendListeners.get(backend);
    if (!listeners) {
      listeners = new Set();
      backendListeners.set(backend, listeners);
    }
    return listeners;
  }, [backend, preview]);
  const notify = useCallback(() => {
    for (const listener of listeners) {
      listener();
    }
  }, [listeners]);
  const subscribeChanges = useCallback(
    (callback: () => void) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    [listeners],
  );
  const browserHttpInstance = useRef<ReturnType<
    typeof createBrowserHttpInstance
  > | null>(null);
  useEffect(() => {
    if (preview || electronMainWorld.isElectron) {
      return;
    }
    const instance = createBrowserHttpInstance(
      app.latestVersion.id,
      async () => {
        const result = await backend.apps.list();
        if (!result.success) {
          throw new Error("Cannot read the active app version");
        }
        return result.data.find((candidate) => candidate.id === app.id)
          ?.latestVersion;
      },
    );
    browserHttpInstance.current = instance;
    const refresh = () => {
      void instance.refresh().then((isCurrent) => {
        if (!isCurrent) {
          void queryClient.invalidateQueries({ queryKey: ["listApps"] });
        }
      });
    };
    const unsubscribe = subscribeChanges(refresh);
    const interval = window.setInterval(refresh, 1000);
    return () => {
      window.clearInterval(interval);
      unsubscribe();
      instance.close();
      browserHttpInstance.current = null;
    };
  }, [
    app.id,
    app.latestVersion.id,
    backend,
    preview,
    subscribeChanges,
    queryClient,
  ]);
  const httpInstance = useRef<ReturnType<
    import("@superego/backend").AppHttpRuntime["open"]
  > | null>(null);
  useEffect(() => {
    const runtime = electronMainWorld.isElectron
      ? electronMainWorld.appHttp
      : null;
    if (preview || !runtime) {
      return;
    }
    const instance = runtime.open(app.id, app.latestVersion.id);
    httpInstance.current = instance;
    const unsubscribe = runtime.onAppsChanged(() => {
      void queryClient.invalidateQueries({ queryKey: ["listApps"] });
      notify();
    });
    return () => {
      httpInstance.current = null;
      unsubscribe();
      void instance.then((result) => {
        if (result.success) {
          void runtime.close(result.data);
        }
      });
    };
  }, [app.id, app.latestVersion.id, preview, queryClient, notify]);
  useEffect(() => {
    if (preview) {
      return;
    }
    return subscribeAppChanges(app.id, () => {
      void queryClient.invalidateQueries({ queryKey: ["listApps"] });
      notify();
    });
  }, [app.id, preview, queryClient, notify]);
  // Browser runtimes use focus as the defined fallback when cross-window events
  // are unavailable. Every mounted sandbox owns its own query cache.
  useEffect(() => {
    const onFocus = () => {
      void queryClient.invalidateQueries({ queryKey: ["listApps"] });
      notify();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [notify, queryClient]);
  const previewState = useMemo(
    () =>
      createPreviewState(app.latestVersion.state, app.latestVersion.id, notify),
    [app.latestVersion.state, app.latestVersion.id, notify],
  );
  return {
    subscribeChanges,
    state: preview
      ? previewState
      : {
          get: () =>
            backend.apps.getState(
              app.id,
              app.latestVersion.id,
              app.latestVersion.stateSchemaId ?? null,
            ),
          update: async (
            expectedRevision: number,
            content: Record<string, unknown>,
          ) => {
            const result = await backend.apps.updateState(
              app.id,
              app.latestVersion.id,
              app.latestVersion.stateSchemaId ?? null,
              expectedRevision,
              content,
            );
            if (result.success) {
              notify();
              announceAppChange(app.id);
            }
            return result;
          },
        },
    http: {
      request: async (request: AppHttpRequest) => {
        if (preview) {
          return appHttpFailure("UnsupportedRuntime");
        }
        if (!electronMainWorld.isElectron) {
          return (
            browserHttpInstance.current?.request(request) ??
            appHttpFailure("ObsoleteInstance")
          );
        }
        const instance = await httpInstance.current;
        if (!instance) {
          return appHttpFailure("ObsoleteInstance");
        }
        if (!instance.success) {
          return instance;
        }
        return electronMainWorld.appHttp.request(instance.data, request);
      },
    },
  };
}
