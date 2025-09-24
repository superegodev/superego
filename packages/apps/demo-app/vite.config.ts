import { cloudflare } from "@cloudflare/vite-plugin";
import browserAppConfig from "@superego/browser-app/vite.config.js";
import { mergeConfig } from "vite";

const isProduction = process.env["VITE_DEPLOY_ENVIRONMENT"] === "production";

export default isProduction
  ? mergeConfig(browserAppConfig, {
      plugins: [cloudflare({ configPath: "production.wrangler.jsonc" })],
    })
  : browserAppConfig;
