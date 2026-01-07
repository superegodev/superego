/// <reference types="vitest/config" />
import optimizeLocales from "@react-aria/optimize-locales-plugin";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";

export default defineConfig({
  resolve: {
    alias: {
      "@formatjs/icu-messageformat-parser":
        "@formatjs/icu-messageformat-parser/no-parser.js",
    },
  },
  plugins: [
    process.env["USE_HTTPS"] === "true" ? basicSsl() : undefined,
    {
      ...optimizeLocales.vite({ locales: ["en-US"] }),
      enforce: "pre",
    },
    react({
      babel: {
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
      },
    }),
    vanillaExtractPlugin(),
    // Enable for analyzing bundle.
    analyzer({ enabled: false }),
  ],
  build: {
    sourcemap: true,
  },
  test: {
    setupFiles: ["./src/vitest-setup.ts"],
    browser: {
      provider: playwright(),
      enabled: true,
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: "chromium" }],
    },
  },
});
