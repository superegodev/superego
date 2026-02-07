import type { Pack } from "@superego/backend";
import { Base64Url } from "@superego/shared-utils";
import cover from "./cover.avif?inline";
import expenses from "./expenses.js";
import expensesApp from "./expensesApp.js";

const pack: Pack = {
  id: "Pack_dev.superego.finance",
  info: {
    name: "Finance",
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
  collectionCategories: [{ name: "Finance", icon: "💰️", parentId: null }],
  collections: [expenses],
  apps: [expensesApp],
  documents: [],
};
export default pack;
