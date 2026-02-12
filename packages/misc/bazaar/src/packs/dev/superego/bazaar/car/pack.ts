import type { Pack } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import fuelLogs from "./fuelLogs.js";
import fuelLogsApp from "./fuelLogsApp.js";
import cover from "./screenshots/0.avif?inline";

export default {
  id: "Pack_dev.superego.bazaar.car",
  info: {
    name: "Car",
    shortDescription: "Log fuel fill-ups and track fuel costs.",
    longDescription: "Log fuel fill-ups and track fuel costs.",
    screenshots: [
      {
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(cover),
      },
    ],
  },
  collectionCategories: [{ name: "Car", icon: "🚙", parentId: null }],
  collections: [fuelLogs],
  apps: [fuelLogsApp],
  documents: [],
} as const satisfies Pack;
