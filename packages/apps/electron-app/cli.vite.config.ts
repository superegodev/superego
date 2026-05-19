import { chmodSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

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
        banner: "#!/usr/bin/env -S node --disable-warning=ExperimentalWarning",
        codeSplitting: false,
        entryFileNames: "superego.js",
      },
    },
  },
  ssr: {
    noExternal: true,
  },
  plugins: [
    {
      name: "make-cli-executable",
      closeBundle() {
        chmodSync(resolve("dist/cli/superego.js"), 0o755);
        copyFileSync(
          resolve(
            "../../../node_modules/@jitl/quickjs-wasmfile-release-sync/dist/emscripten-module.wasm",
          ),
          resolve("dist/cli/emscripten-module.wasm"),
        );
      },
    },
  ],
});
