import path from "node:path";
import url from "node:url";
import { app, net, protocol } from "electron";

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
  ]);
  app.whenReady().then(() => {
    protocol.handle("dev.superego.app-sandbox", (request) => {
      const { pathname } = new URL(request.url);
      const baseDir = path.resolve(import.meta.dirname, "../renderer");
      const pathToServe = path.resolve(baseDir, pathname);
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
  });
}
