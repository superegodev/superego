import { AppVersionFiles, type AppVersion } from "@superego/backend";

export default function makeAppFiles(
  source: string,
  compiled: string,
): AppVersion["files"] {
  return {
    "/src/main.tsx": {
      role: "source",
      mimeType: "text/plain",
      content: source,
    },
    [AppVersionFiles.APP_VERSION_ENTRYPOINT]: {
      role: "build",
      mimeType: "text/html",
      content: `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.js"></script>
  </body>
</html>
      `.trim(),
    },
    "/dist/main.js": {
      role: "build",
      mimeType: "text/javascript",
      content: compiled,
    },
  };
}
