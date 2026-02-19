import { resolve } from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import browserAppConfig from "@superego/browser-app/vite.config.js";
import { mergeConfig, type UserConfig } from "vite";

const isProduction = process.env["VITE_DEPLOY_ENVIRONMENT"] === "production";

export default isProduction
  ? mergeConfig(browserAppConfig as UserConfig, {
      plugins: [cloudflare({ configPath: "production.wrangler.jsonc" })],
      environments: {
        client: {
          build: {
            rollupOptions: {
              input: {
                index: resolve(import.meta.dirname, "./index.html"),
                appSandbox: resolve(import.meta.dirname, "./app-sandbox.html"),
              },
            },
          },
        },
      },
    })
  : browserAppConfig;
