import type {
  AppHttpRequest,
  AppVersion,
  AppVersionId,
} from "@superego/backend";
import { appHttpFailure } from "@superego/shared-utils";
import executeBrowserHttpRequest from "./executeBrowserHttpRequest.js";

/** Identity and permissions come from the host's database, never from iframe arguments. */
export default function createBrowserHttpInstance(
  versionId: AppVersionId,
  getCurrentVersion: () => Promise<AppVersion | undefined>,
) {
  const lifetime = new AbortController();
  const close = () => lifetime.abort();
  const current = async () => {
    const version = await getCurrentVersion();
    if (!version || version.id !== versionId) {
      close();
      return undefined;
    }
    return version;
  };
  return {
    close,
    refresh: async () => {
      try {
        return !!(await current());
      } catch {
        close();
        return false;
      }
    },
    request: async (request: AppHttpRequest) => {
      try {
        if (lifetime.signal.aborted) {
          return appHttpFailure("ObsoleteInstance");
        }
        const version = await current();
        if (!version || lifetime.signal.aborted) {
          return appHttpFailure("ObsoleteInstance");
        }
        const result = await executeBrowserHttpRequest(
          request,
          version.permissions?.http?.allowedOrigins ?? [],
          lifetime.signal,
        );
        return lifetime.signal.aborted
          ? appHttpFailure("ObsoleteInstance")
          : result;
      } catch {
        return appHttpFailure("TransportFailure");
      }
    },
  };
}
