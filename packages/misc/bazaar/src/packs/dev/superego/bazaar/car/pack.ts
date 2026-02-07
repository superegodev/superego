import type { Pack } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import cover from "./cover.avif?inline";
import fuelLogs from "./fuelLogs.js";
import fuelLogsApp from "./fuelLogsApp.js";

export default {
  id: "Pack_dev.superego.car",
  info: {
    name: "Car",
    coverImage: "cover.avif",
    shortDescription: "TODO_BAZAAR: write",
    longDescription: "TODO_BAZAAR: write",
    images: [
      {
        path: "cover.avif",
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
