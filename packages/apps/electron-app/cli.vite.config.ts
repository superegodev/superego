import { chmodSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const banner = [
  "#!/usr/bin/env node",
  'import { fileURLToPath as __vite_fileURLToPath } from "node:url";',
  'import { dirname as __vite_dirname } from "node:path";',
  'import { createRequire as __vite_createRequire } from "node:module";',
  "const __filename = __vite_fileURLToPath(import.meta.url);",
  "const __dirname = __vite_dirname(__filename);",
  "const require = __vite_createRequire(import.meta.url);",
].join("\n");

export default defineConfig({
  build: {
    outDir: "dist/cli",
    ssr: true,
    lib: {
      entry: "src/cli/index.ts",
      formats: ["es"],
      fileName: "superego",
    },
    rollupOptions: {
      output: {
        banner,
        entryFileNames: "superego.js",
      },
    },
  },
  ssr: {
    noExternal: true,
  },
  plugins: [
    {
      name: "chmod-cli",
      closeBundle() {
        chmodSync(resolve("dist/cli/superego.js"), 0o755);
      },
    },
  ],
});
