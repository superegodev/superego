import { type Pack, Theme } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import fuelLogs from "./fuelLogs.js";
import fuelLogsApp from "./fuelLogsApp.js";
import screenshot0Dark from "./screenshots/0.dark.avif?inline";
import screenshot0Light from "./screenshots/0.light.avif?inline";

export default {
  id: "Pack_dev.superego.bazaar.car",
  info: {
    name: "Car",
    shortDescription: "Log fuel fill-ups and track fuel costs.",
    longDescription: "Log fuel fill-ups and track fuel costs.",
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
  collectionCategories: [{ name: "Car", icon: "🚙", parentId: null }],
  collections: [fuelLogs],
  apps: [fuelLogsApp],
  documents: [],
} as const satisfies Pack;
