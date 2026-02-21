import http from "node:http";
import type { Backend } from "@superego/backend";
import { onOAuth2PKCEAuthorizationResponseUrl } from "@superego/connectors";
import { escapeHtml } from "@superego/shared-utils";
import { BrowserWindow } from "electron";

export default function startOAuth2PKCECallbackServer(
  port: number,
  backend: Backend,
) {
  http
    .createServer(async (req, res) => {
      if (req.method !== "GET" && req.url !== "") {
        res.writeHead(404);
        res.end();
        return;
      }

      const result = await onOAuth2PKCEAuthorizationResponseUrl(
        backend,
        `http://localhost:${port}${req.url}`,
      );

      const statusCode = result.success ? 200 : 400;
      const title = result.success
        ? `Superego ${result.data.remote?.connector.name} Authentication Succeeded`
        : "Superego Authentication Failed";
      const content = result.success
        ? "<p>You can close this browser tab.</p>"
        : ` <pre><code>${escapeHtml(JSON.stringify(result.error, null, 2))}</code></pre>`;
      res.writeHead(statusCode);
      res.end(`
        <!DOCTYPE html>
        <html>
          <head><title>${title}</title></head>
          <body><h1>${title}</h1>${content}</body>
        </html>
      `);

      if (result.success) {
        for (const window of BrowserWindow.getAllWindows()) {
          window.webContents.postMessage("OAuth2PKCEFlowSucceeded", {
            type: "OAuth2PKCEFlowSucceeded",
          });
        }
      }
    })
    .listen(port);
}
