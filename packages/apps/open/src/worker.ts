import { deepLinkProtocol } from "@superego/routing";

const noStoreHeaders = {
  "Cache-Control": "no-store",
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
      headers: noStoreHeaders,
    });
  }

  const url = new URL(request.url);
  if (url.pathname === "/robots.txt") {
    return textResponse("User-agent: *\nDisallow: /\n");
  }
  if (url.pathname === "/" || url.pathname === "/privacy") {
    return htmlResponse(getInfoPage());
  }
  if (!isSafeHref(url.pathname)) {
    return textResponse("Not found\n", 404);
  }

  return new Response(null, {
    status: 302,
    headers: {
      ...noStoreHeaders,
      Location: `${deepLinkProtocol}://${url.pathname}${url.search}`,
    },
  });
}

function isSafeHref(pathname: string): boolean {
  return pathname.startsWith("/") && !pathname.startsWith("//");
}

function textResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      ...noStoreHeaders,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

function htmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      ...noStoreHeaders,
      "Content-Type": "text/html; charset=utf-8",
    },
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
    <h1>Open Superego Links</h1>
    <p>
      This service redirects links from <code>https://open.superego.dev/...</code>
      to the Superego desktop app using <code>superego://...</code>.
    </p>
    <p>
      The URL path contains Superego resource IDs. Resource IDs can be sensitive
      because they identify local collections, documents, versions, and apps.
    </p>
    <p>
      Superego does not store, analyze, or log these IDs in this Worker. The
      request is still processed by Cloudflare to provide the redirect.
    </p>
  </body>
</html>`;
}
