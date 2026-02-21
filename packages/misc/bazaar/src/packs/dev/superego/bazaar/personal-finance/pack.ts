import { type Pack, Theme } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import expenses from "./expenses.js";
import expensesApp from "./expensesApp.js";
import screenshot0Dark from "./screenshots/0.dark.avif?inline";
import screenshot0Light from "./screenshots/0.light.avif?inline";

export default {
  id: "Pack_dev.superego.bazaar.personal-finance",
  info: {
    name: "Personal Finance",
    shortDescription: "Track expenses and analyze your spending.",
    longDescription: "Track expenses and analyze your spending.",
    screenshots: [
      {
        theme: Theme.Light,
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(screenshot0Light),
      },
      {
        theme: Theme.Dark,
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(screenshot0Dark),
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
