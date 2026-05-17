import type { AppVersion, TypescriptModule } from "@superego/backend";

export type RHFAppVersionFiles = {
  "/main__DOT__tsx": TypescriptModule;
};

export default {
  fromRhfAppVersionFiles(
    rhfAppVersionFiles: RHFAppVersionFiles,
  ): AppVersion["files"] {
    return makeAppVersionFiles(rhfAppVersionFiles["/main__DOT__tsx"]);
  },

  toRhfAppVersionFiles(
    appVersionFiles: AppVersion["files"],
  ): RHFAppVersionFiles {
    const sourceFile = appVersionFiles["/src/main.tsx"];
    const compiledFile = appVersionFiles["/dist/main.js"];
    return {
      "/main__DOT__tsx": {
        source:
          typeof sourceFile?.content === "string" ? sourceFile.content : "",
        compiled:
          typeof compiledFile?.content === "string" ? compiledFile.content : "",
      },
    };
  },
};

function makeAppVersionFiles(mainTsx: TypescriptModule): AppVersion["files"] {
  return {
    "/src/main.tsx": {
      role: "source",
      mimeType: "text/plain",
      content: mainTsx.source,
    },
    "/dist/index.html": {
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
      content: mainTsx.compiled,
    },
  };
}
