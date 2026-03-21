import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { defineCollection } from "astro:content";

export const collections: Record<
  string,
  ReturnType<typeof defineCollection>
> = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
