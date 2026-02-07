import type { Pack } from "@superego/backend";
import { Base64Url } from "@superego/shared-utils";
import cover from "./cover.avif?inline";
import foods from "./foods.js";
import meals from "./meals.js";
import weighIns from "./weighIns.js";

const pack: Pack = {
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
        content: Base64Url.decodeToBytes(cover),
      },
    ],
  },
  collectionCategories: [{ name: "Diet", icon: "🥦", parentId: null }],
  collections: [foods, meals, weighIns],
  apps: [],
  documents: [],
};
export default pack;
