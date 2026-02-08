import type { Pack } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import cover from "./cover.avif?inline";
import expenses from "./expenses.js";
import expensesApp from "./expensesApp.js";

export default {
  id: "Pack_dev.superego.finance",
  info: {
    name: "Finance",
    shortDescription: "TODO_BAZAAR: write",
    longDescription: "TODO_BAZAAR: write",
    images: [
      {
        path: "/cover.avif",
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(cover),
      },
    ],
  },
  collectionCategories: [{ name: "Finance", icon: "💰️", parentId: null }],
  collections: [expenses],
  apps: [expensesApp],
  documents: [],
} as const satisfies Pack;
