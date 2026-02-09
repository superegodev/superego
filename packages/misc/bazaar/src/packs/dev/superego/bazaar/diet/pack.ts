import type { Pack } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import foods from "./foods.js";
import meals from "./meals.js";
import cover from "./screenshots/0.avif?inline";
import weighIns from "./weighIns.js";

export default {
  id: "Pack_dev.superego.bazaar.diet",
  info: {
    name: "Diet",
    shortDescription: "TODO_BAZAAR: write",
    longDescription: "TODO_BAZAAR: write",
    screenshots: [
      {
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
