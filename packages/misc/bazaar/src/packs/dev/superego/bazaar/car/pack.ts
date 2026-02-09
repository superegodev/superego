import type { Pack } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import fuelLogs from "./fuelLogs.js";
import fuelLogsApp from "./fuelLogsApp.js";
import cover from "./screenshots/0.avif?inline";

export default {
  id: "Pack_dev.superego.bazaar.car",
  info: {
    name: "Car",
    shortDescription: "TODO_BAZAAR: write",
    longDescription: "TODO_BAZAAR: write",
    screenshots: [
      {
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(cover),
      },
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
