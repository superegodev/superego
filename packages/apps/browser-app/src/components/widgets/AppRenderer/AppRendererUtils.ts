import type { App, AppVersionFile } from "@superego/backend";
import { AppVersionFileUtils } from "@superego/backend";
import { makeSuccessfulResult } from "@superego/shared-utils";
import {
  fromHref,
  toHref,
} from "../../../business-logic/navigation/RouteUtils.js";

export interface StaticAppBridgeBackend {
  documents: {
    create: (...args: any[]) => any;
    createNewVersion: (...args: any[]) => any;
    delete: (...args: any[]) => any;
  };
  files: {
    getContent: (...args: any[]) => any;
  };
}

export async function invokeAllowedBackendMethod(
  backend: StaticAppBridgeBackend,
  payload: unknown,
): Promise<unknown> {
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof (payload as any).invocationId !== "string" ||
    typeof (payload as any).entity !== "string" ||
    typeof (payload as any).method !== "string" ||
    !Array.isArray((payload as any).args)
  ) {
    return makeSuccessfulResult(null);
  }

  const { entity, method, args } = payload as {
    entity: string;
    method: string;
    args: unknown[];
  };
  if (entity === "documents" && method === "create") {
    return backend.documents.create(...args);
  }
  if (entity === "documents" && method === "createNewVersion") {
    return backend.documents.createNewVersion(...args);
  }
  if (entity === "documents" && method === "delete") {
    return backend.documents.delete(...args);
  }
  if (entity === "files" && method === "getContent") {
    return backend.files.getContent(...args);
  }
  return makeSuccessfulResult(null);
}

export function isValidNavigationHref(
  href: unknown,
  origin = window.location.origin,
): href is string {
  if (typeof href !== "string") {
    return false;
  }
  try {
    const parsedUrl = new URL(href, origin);
    if (parsedUrl.origin !== origin) {
      return false;
    }
    const route = fromHref(`${parsedUrl.pathname}${parsedUrl.search}`);
    const normalizedUrl = new URL(toHref(route), origin);
    return normalizedUrl.pathname === parsedUrl.pathname;
  } catch {
    return false;
  }
}

export function makeStaticAppUrl(app: App): string {
  return `dev.superego.app://app/${encodeURIComponent(app.id)}/${encodeURIComponent(app.latestVersion.id)}${app.latestVersion.entrypoint}`;
}

export function makeIframeSrc(
  app: App,
  options: { isElectron: boolean },
): string {
  if (options.isElectron) {
    return makeStaticAppUrl(app);
  }

  if (hasExternalBuildAssetReferences(app.latestVersion.files)) {
    return URL.createObjectURL(
      new Blob([unsupportedBrowserHtml()], { type: "text/html" }),
    );
  }

  const entrypoint = app.latestVersion.files[app.latestVersion.entrypoint];
  const content =
    typeof entrypoint?.content === "string"
      ? entrypoint.content
      : "<!doctype html><html><body>App entrypoint is not text.</body></html>";
  return URL.createObjectURL(new Blob([content], { type: "text/html" }));
}

export function hasExternalBuildAssetReferences(
  files: Record<string, AppVersionFile>,
): boolean {
  const entrypoint = files[AppVersionFileUtils.APP_VERSION_ENTRYPOINT];
  if (typeof entrypoint?.content !== "string") {
    return false;
  }
  return /<(script|link|img|source)\b[^>]*(?:src|href)\s*=\s*["'](?!data:|blob:|https?:\/\/|#)([^"']+)["'][^>]*>/i.test(
    entrypoint.content,
  );
}

export function unsupportedBrowserHtml(): string {
  return `
<!doctype html>
<html>
  <body>
    <p>This app uses multiple static files and can only be rendered in the desktop app right now.</p>
  </body>
</html>
  `.trim();
}
