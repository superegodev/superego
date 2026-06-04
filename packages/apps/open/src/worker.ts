import { deepLinkProtocol } from "@superego/routing";

const baseHeaders = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

const htmlHeaders = {
  ...baseHeaders,
  "Content-Security-Policy": [
    "default-src 'none'",
    "script-src 'unsafe-inline'",
    "style-src 'unsafe-inline'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; "),
  "Content-Type": "text/html; charset=utf-8",
} as const;

export default {
  fetch(request) {
    return handleRequest(request);
  },
} satisfies ExportedHandler;

export function handleRequest(request: Request): Response {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: baseHeaders,
    });
  }

  const url = new URL(request.url);
  if (url.pathname === "/robots.txt") {
    return textResponse("User-agent: *\nDisallow: /\n");
  }
  if (url.pathname === "/" || url.pathname === "/privacy") {
    return htmlResponse(getInfoPage());
  }
  return textResponse("Not found\n", 404);
}

function textResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      ...baseHeaders,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

function htmlResponse(body: string): Response {
  return new Response(body, {
    headers: htmlHeaders,
  });
}

function getInfoPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>Open Superego Links</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      body {
        line-height: 1.5;
        margin: 40px;
        max-width: 720px;
      }
      h1 {
        font-size: 24px;
        margin: 0 0 16px;
      }
      p {
        margin: 0 0 12px;
      }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }
    </style>
  </head>
  <body>
    <h1 id="title">Open Superego Links</h1>
    <p id="status">This page opens Superego desktop app links.</p>
    <p>
      Privacy notice: Superego link details belong in the URL fragment, which
      browsers keep client-side and do not send to this service.
    </p>
    <p>
      If Superego does not open, make sure the desktop app is installed and
      registered for <code>${deepLinkProtocol}://</code> links.
    </p>
    <script>
      (() => {
        const searchParams = new URLSearchParams(window.location.hash.slice(1));
        const deepLink = searchParams.get("deepLink");
        if (deepLink === null) {
          return;
        }

        let deepLinkUrl;
        try {
          deepLinkUrl = new URL(deepLink);
        } catch {
          return;
        }

        if (deepLinkUrl.protocol === "${deepLinkProtocol}:") {
          document.title = "Opening Superego link";
          document.getElementById("title").textContent =
            "Opening Superego link";
          const status = document.getElementById("status");
          status.textContent = "Opening ";
          const code = document.createElement("code");
          code.textContent = deepLink;
          status.append(code, ".");
          window.location.replace(deepLink);
        }
      })();
    </script>
  </body>
</html>`;
}
