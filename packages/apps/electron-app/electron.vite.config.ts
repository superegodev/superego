import { resolve } from "node:path";
import formatjs from "@formatjs/unplugin/rollup";
import browserAppViteConfig from "@superego/browser-app/vite.config.js";
import { defineConfig } from "electron-vite";
import { mergeConfig, type UserConfig } from "vite";

export default defineConfig({
  main: {
    build: {
      externalizeDeps: false,
      rollupOptions: {
        output: { format: "es" },
        external: ["electron", "typescript", "@typescript/vfs"],
        plugins: [
          formatjs({
            idInterpolationPattern:
              "[name].[ext]_[sha512:contenthash:base64:6]",
            removeDefaultMessage: true,
          }),
        ],
      },
    },
  },
  preload: {
    build: {
      externalizeDeps: false,
      rollupOptions: {
        output: { format: "cjs" },
        external: ["electron"],
      },
    },
  },
  renderer: mergeConfig(browserAppViteConfig as UserConfig, {
    define: {
      "import.meta.env.VITE_SANDBOX_URL": JSON.stringify(
        "dev.superego.app-sandbox://localhost/app-sandbox.html",
      ),
    },
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
