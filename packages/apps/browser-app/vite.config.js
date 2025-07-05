import optimizeLocales from "@react-aria/optimize-locales-plugin";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@formatjs/icu-messageformat-parser":
        "@formatjs/icu-messageformat-parser/no-parser",
    },
  },
  plugins: [
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
  ],
});
