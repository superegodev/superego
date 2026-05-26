import { SchemaJsonSchema } from "@superego/schema";
import { getMonacoTypescriptCompilerOptions } from "@superego/shared-utils";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker.js?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker.js?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker.js?worker";
// @ts-expect-error: no declaration for this file.
import { setupMode } from "monaco-editor/esm/vs/language/json/jsonMode.js";
// @ts-expect-error: no declaration for this file.
import { jsonDefaults } from "monaco-editor/esm/vs/language/json/monaco.contribution.js";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker.js?worker";

(self as any).MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};
monaco.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.typescript.typescriptDefaults.setCompilerOptions(
  getMonacoTypescriptCompilerOptions(monaco.typescript),
);
monaco.json.jsonDefaults.setDiagnosticsOptions({
  schemas: [
    {
      uri: "https://superego.dev/json-schemas/schema.json",
      fileMatch: ["schema.json"],
      schema: SchemaJsonSchema,
    },
  ],
});
// Workaround for https://github.com/microsoft/monaco-editor/issues/3105
setupMode(jsonDefaults);

export default monaco;
