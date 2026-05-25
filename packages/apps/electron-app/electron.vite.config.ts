import { chmodSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import formatjs from "@formatjs/unplugin/rollup";
import browserAppViteConfig from "@superego/browser-app/vite.config.js";
import { defineConfig } from "electron-vite";
import {
  mergeConfig,
  type Plugin,
  type ResolvedConfig,
  type UserConfig,
} from "vite";

type WritableResolvedConfig = ResolvedConfig & { plugins: Plugin[] };

export default defineConfig({
  main: {
    plugins: [
      {
        name: "remove-electron-vite-esm-shim",
        enforce: "post",
        configResolved(config) {
          // electron-vite's ESM shim uses regexes on rendered chunks. With the
          // Rolldown bundle, it can match import-looking text inside embedded
          // strings, inject the shim there, and emit an empty main entry.
          // https://github.com/alex8088/electron-vite/issues/906
          const writableConfig = config as WritableResolvedConfig;
          writableConfig.plugins = writableConfig.plugins.filter(
            (plugin) => plugin.name !== "vite:esm-shim",
          );
        },
      },
      {
        name: "build-cli-resources",
        closeBundle() {
          const cliDistDir = resolve(import.meta.dirname, "dist/cli");

          rmSync(cliDistDir, { recursive: true, force: true });
          mkdirSync(cliDistDir, { recursive: true });

          copyFileSync(
            resolve(import.meta.dirname, "src/cli/launcher.sh"),
            resolve(cliDistDir, "superego"),
          );
          chmodSync(resolve(cliDistDir, "superego"), 0o755);

          copyFileSync(
            resolve(
              import.meta.dirname,
              "../../../node_modules/@jitl/quickjs-wasmfile-release-sync/dist/emscripten-module.wasm",
            ),
            resolve(cliDistDir, "emscripten-module.wasm"),
          );
        },
      },
    ],
    build: {
      externalizeDeps: false,
      rolldownOptions: {
        output: { format: "es" },
        external: ["electron", "typescript", "@typescript/vfs"],
        plugins: [
          formatjs({
            idInterpolationPattern:
              "[name].[ext]_[sha512:contenthash:base64:6]",
            removeDefaultMessage: true,
            flatten: false,
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
