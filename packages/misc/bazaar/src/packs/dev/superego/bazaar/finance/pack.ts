import type { Pack } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import expenses from "./expenses.js";
import expensesApp from "./expensesApp.js";
import cover from "./screenshots/0.avif?inline";

export default {
  id: "Pack_dev.superego.bazaar.finance",
  info: {
    name: "Finance",
    shortDescription: "TODO_BAZAAR: write",
    longDescription: "TODO_BAZAAR: write",
    screenshots: [
      {
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
