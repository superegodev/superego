import type { Pack } from "@superego/backend";
import { Base64Url } from "@superego/shared-utils";
import cover from "./cover.avif?inline";
import fuelLogs from "./fuelLogs.js";
import fuelLogsApp from "./fuelLogsApp.js";

const pack: Pack = {
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
        content: Base64Url.decodeToBytes(cover),
      },
    ],
  },
  collectionCategories: [{ name: "Car", icon: "🚙", parentId: null }],
  collections: [fuelLogs],
  apps: [fuelLogsApp],
  documents: [],
};
export default pack;
