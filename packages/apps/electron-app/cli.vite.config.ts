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
        assetFileNames: "[name][extname]",
        banner: "#!/usr/bin/env node",
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
      name: "copy-cli-launcher",
      closeBundle() {
        copyFileSync(
          resolve(import.meta.dirname, "src/cli/launcher.sh"),
          resolve(import.meta.dirname, "dist/cli/superego"),
        );
        copyFileSync(
          resolve(
            import.meta.dirname,
            "../../../node_modules/@jitl/quickjs-wasmfile-release-sync/dist/emscripten-module.wasm",
          ),
          resolve(import.meta.dirname, "dist/cli/emscripten-module.wasm"),
        );
        chmodSync(resolve(import.meta.dirname, "dist/cli/superego"), 0o755);
        chmodSync(resolve(import.meta.dirname, "dist/cli/superego.js"), 0o755);
      },
    },
  ],
});
