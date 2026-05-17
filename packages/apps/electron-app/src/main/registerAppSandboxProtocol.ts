import path from "node:path";
import url from "node:url";
import { AppVersionFileUtils } from "@superego/backend";
import type { AppId, AppVersionId, Backend } from "@superego/backend";
import { app, net, protocol } from "electron";

let backendForAppProtocol: Backend | null = null;

export function setAppProtocolBackend(backend: Backend): void {
  backendForAppProtocol = backend;
}

export default function registerAppSandboxProtocol() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: "dev.superego.app-sandbox",
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
      },
    },
    {
      scheme: "dev.superego.app",
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
      },
    },
  ]);
  app.whenReady().then(() => {
    protocol.handle("dev.superego.app-sandbox", (request) => {
      const { pathname } = new URL(request.url);
      const baseDir = path.resolve(import.meta.dirname, "../renderer");
      const pathToServe = path.join(baseDir, pathname);
      const relativePath = path.relative(baseDir, pathToServe);
      const isSafe =
        !relativePath.startsWith("..") && !path.isAbsolute(relativePath);

      if (!isSafe) {
        return new Response("Access denied", {
          status: 403,
          headers: { "content-type": "text/plain" },
        });
      }

      return net.fetch(url.pathToFileURL(pathToServe).toString());
    });

    protocol.handle("dev.superego.app", async (request) => {
      if (!backendForAppProtocol) {
        return textResponse("Backend unavailable", 503);
      }

      const requestUrl = new URL(request.url);
      if (requestUrl.hostname !== "app") {
        return textResponse("Not found", 404);
      }
      const rawPathParts = requestUrl.pathname.split("/").filter(Boolean);
      if (
        rawPathParts.some((part) => /%2f|%5c|\\/i.test(part)) ||
        requestUrl.pathname.includes("//")
      ) {
        return textResponse("Not found", 404);
      }
      const [encodedAppId, encodedAppVersionId, ...encodedPathParts] =
        rawPathParts;
      if (!encodedAppId || !encodedAppVersionId) {
        return textResponse("Not found", 404);
      }
      const appId = decodeURIComponent(encodedAppId);
      const appVersionId = decodeURIComponent(encodedAppVersionId);
      const requestedPath = AppVersionFileUtils.normalizeAppVersionPath(
        `/${encodedPathParts.map((part) => decodeURIComponent(part)).join("/")}`,
      );
      if (!requestedPath || !requestedPath.startsWith("/dist/")) {
        return textResponse("Not found", 404);
      }

      const result = await backendForAppProtocol.apps.getVersionBuildFile(
        appId as AppId,
        appVersionId as AppVersionId,
        requestedPath,
      );
      if (!result.success) {
        return textResponse("Not found", 404);
      }

      return new Response(result.data.content, {
        headers: {
          "content-type": result.data.mimeType,
          "content-security-policy": [
            "default-src 'self' 'unsafe-inline' data: blob:",
            "connect-src 'self' https://tiles.openfreemap.org",
            "font-src 'self' data:",
            "frame-src 'none'",
            "img-src 'self' data: blob:",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
          ].join("; "),
        },
      });
    });
  });
}

function textResponse(text: string, status: number): Response {
  return new Response(text, {
    status,
    headers: { "content-type": "text/plain" },
  });
}
