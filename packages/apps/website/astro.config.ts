import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightThemeNova from "starlight-theme-nova";

export default defineConfig({
  site: "https://superego.dev",
  cacheDir: ".astro-build-cache",
  integrations: [
    starlight({
      title: "Superego",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/superegodev/superego",
        },
      ],
      sidebar: [
        { label: "Connectors", autogenerate: { directory: "connectors" } },
      ],
      plugins: [starlightThemeNova()],
      customCss: ["./src/styles/overrides.css"],
    }),
  ],
});
