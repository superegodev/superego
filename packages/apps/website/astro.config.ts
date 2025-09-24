import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://superego.dev",
  cacheDir: ".astro-build-cache",
  integrations: [mdx()],
});
