import type { Pack } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import expenses from "./expenses.js";
import expensesApp from "./expensesApp.js";
import cover from "./screenshots/0.avif?inline";

export default {
  id: "Pack_dev.superego.bazaar.personal-finance",
  info: {
    name: "Personal Finance",
    shortDescription: "Track expenses and analyze your spending.",
    longDescription: "Track expenses and analyze your spending.",
    screenshots: [
      {
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(cover),
      },
    ],
  },
  collectionCategories: [
    { name: "Personal Finance", icon: "💰️", parentId: null },
  ],
  collections: [expenses],
  apps: [expensesApp],
  documents: [],
} as const satisfies Pack;
