import { chmodSync } from "node:fs";
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
        banner: "#!/usr/bin/env node",
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
      },
    },
  ],
});
