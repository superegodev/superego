import browserAppViteConfig from "@superego/browser-app/vite.config.js";
import { defineConfig } from "electron-vite";
import { mergeConfig, type UserConfig } from "vite";

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        output: { format: "es" },
        external: ["typescript"],
      },
    },
  },
  preload: {},
  renderer: mergeConfig(browserAppViteConfig as UserConfig, {
    build: {
      sourcemap: false,
    },
  }),
});
