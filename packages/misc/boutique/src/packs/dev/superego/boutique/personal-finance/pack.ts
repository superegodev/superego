import { type Pack, Theme } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import accounts from "./accounts.js";
import expenses from "./expenses.js";
import expensesApp from "./expensesApp.js";
import holdings from "./holdings.js";
import portfolioDashboardApp from "./portfolioDashboardApp.js";
import screenshot0Dark from "./screenshots/0.dark.avif?inline";
import screenshot0Light from "./screenshots/0.light.avif?inline";
import screenshot1Dark from "./screenshots/1.dark.avif?inline";
import screenshot1Light from "./screenshots/1.light.avif?inline";
import securities from "./securities.js";

export default {
  id: "Pack_dev.superego.boutique.personal-finance",
  info: {
    name: "Personal Finance",
    shortDescription:
      "Track expenses, manage a securities portfolio, and analyze your spending.",
    longDescription:
      "Track expenses, manage a securities portfolio, and analyze your spending. Includes a portfolio dashboard with allocation charts and performance tracking.",
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
      {
        theme: Theme.Light,
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(screenshot1Light),
      },
      {
        theme: Theme.Dark,
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(screenshot1Dark),
      },
    ],
  },
  collectionCategories: [
    { name: "Personal Finance", icon: "💰️", parentId: null },
    { name: "Portfolio", icon: "💼", parentId: "ProtoCollectionCategory_0" },
  ],
  collections: [expenses, securities, holdings, accounts],
  apps: [expensesApp, portfolioDashboardApp],
  documents: [],
} as const satisfies Pack;
