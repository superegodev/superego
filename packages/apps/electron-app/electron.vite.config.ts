import browserAppViteConfig from "@superego/browser-app/vite.config.js";
import { defineConfig } from "electron-vite";

export default defineConfig({
  main: {
    build: {
      sourcemap: true,
      rollupOptions: {
        output: { format: "es" },
      },
    },
  },
  preload: {
    build: {
      sourcemap: true,
    },
  },
  renderer: browserAppViteConfig,
});
