import type { Pack } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import cover from "./cover.avif?inline";
import foods from "./foods.js";
import meals from "./meals.js";
import weighIns from "./weighIns.js";

export default {
  id: "Pack_dev.superego.diet",
  info: {
    name: "Diet",
    coverImage: "cover.avif",
    shortDescription: "TODO_BAZAAR: write",
    longDescription: "TODO_BAZAAR: write",
    images: [
      {
        path: "cover.avif",
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(cover),
      },
    ],
  },
  collectionCategories: [{ name: "Diet", icon: "🥦", parentId: null }],
  collections: [foods, meals, weighIns],
  apps: [],
  documents: [],
} as const satisfies Pack;
