import { resolve } from "node:path";
import babel from "@rollup/plugin-babel";
import browserAppViteConfig from "@superego/browser-app/vite.config.js";
import { defineConfig } from "electron-vite";
import { mergeConfig, type UserConfig } from "vite";

export default defineConfig({
  main: {
    build: {
      externalizeDeps: false,
      rollupOptions: {
        output: { format: "es" },
        external: ["typescript", "@typescript/vfs"],
        plugins: [
          babel({
            babelHelpers: "bundled",
            extensions: [".ts"],
            plugins: [
              [
                "formatjs",
                {
                  idInterpolationPattern:
                    "[name].[ext]_[sha512:contenthash:base64:6]",
                  removeDefaultMessage: true,
                },
              ],
            ],
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
      },
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
