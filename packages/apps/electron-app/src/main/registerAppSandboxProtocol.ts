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
      const filePath = request.url.slice(
        "dev.superego.app-sandbox://localhost/".length,
      );
      return net.fetch(
        url
          .pathToFileURL(
            path.join(import.meta.dirname, "../renderer", filePath),
          )
          .toString(),
      );
    });
  });
}
