import browserAppViteConfig from "@superego/browser-app/vite.config.js";
import { defineConfig } from "electron-vite";

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        output: { format: "es" },
      },
    },
  },
  preload: {},
  renderer: browserAppViteConfig,
});
