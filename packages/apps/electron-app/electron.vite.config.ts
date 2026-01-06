import { resolve } from "node:path";
import browserAppViteConfig from "@superego/browser-app/vite.config.js";
import { defineConfig } from "electron-vite";
import { mergeConfig, type UserConfig } from "vite";

export default defineConfig({
  main: {
    build: {
      externalizeDeps: false,
      rollupOptions: {
        output: { format: "es" },
        external: ["typescript"],
      },
    },
  },
  preload: {
    build: {
      externalizeDeps: false,
    },
  },
  renderer: mergeConfig(browserAppViteConfig as UserConfig, {
    build: {
      sourcemap: false,
      rollupOptions: {
        input: {
          index: resolve(import.meta.dirname, "./src/renderer/index.html"),
          appSandbox: resolve(
            import.meta.dirname,
            "./src/renderer/app-sandbox.html",
          ),
        },
      },
    },
  }),
});
