import path from "node:path";
import url from "node:url";
import type { Backend } from "@superego/backend";
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
      const appId = requestUrl.hostname;
      const [appVersionId, ...pathParts] = requestUrl.pathname
        .split("/")
        .filter(Boolean);
      const requestedPath = `/${pathParts.join("/")}`;
      if (!appVersionId || !requestedPath.startsWith("/dist/")) {
        return textResponse("Not found", 404);
      }

      const result = await backendForAppProtocol.apps.list();
      if (!result.success) {
        return textResponse("Failed to load apps", 500);
      }

      const appToServe = result.data.find(
        (candidate) => candidate.id === appId,
      );
      if (
        !appToServe ||
        appToServe.latestVersion.id !== appVersionId ||
        appToServe.latestVersion.entrypoint !== "/dist/index.html"
      ) {
        return textResponse("Not found", 404);
      }

      const file =
        appToServe.latestVersion.files[requestedPath as `/${string}`];
      if (!file || file.role !== "build") {
        return textResponse("Not found", 404);
      }

      return new Response(file.content, {
        headers: {
          "content-type": file.mimeType,
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
