import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections: Record<
  string,
  ReturnType<typeof defineCollection>
> = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
