import { resolve } from "node:path";
import browserAppViteConfig from "@superego/browser-app/vite.config.js";
import { mergeConfig, type UserConfig } from "vite";

export default mergeConfig(browserAppViteConfig as UserConfig, {
  mode: "devenv",
  base: "./",
  root: resolve(import.meta.dirname, "./src/renderer"),
  define: {
    "process.env.NODE_ENV": JSON.stringify("development"),
    "import.meta.env.VITE_SANDBOX_URL": JSON.stringify(
      "dev.superego.app-sandbox://localhost/app-sandbox-devenv.html",
    ),
  },
  build: {
    outDir: resolve(import.meta.dirname, "dist/renderer"),
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "./src/renderer/index-devenv.html"),
        appSandbox: resolve(
          import.meta.dirname,
          "./src/renderer/app-sandbox-devenv.html",
        ),
      },
    },
  },
});
