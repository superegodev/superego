import type { Pack } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import cycleDayLogs from "./cycleDayLogs.js";
import cycleDayLogsApp from "./cycleDayLogsApp.js";
import foods from "./foods.js";
import meals from "./meals.js";
import cover from "./screenshots/0.avif?inline";
import weighIns from "./weighIns.js";

export default {
  id: "Pack_dev.superego.bazaar.health",
  info: {
    name: "Health",
    shortDescription: "Track nutrition, cycle logs, and weigh-ins.",
    longDescription: "Track nutrition, cycle logs, and weigh-ins.",
    screenshots: [
      {
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(cover),
      },
    ],
  },
  collectionCategories: [{ name: "Health", icon: "🥦", parentId: null }],
  collections: [cycleDayLogs, foods, meals, weighIns],
  apps: [cycleDayLogsApp],
  documents: [],
} as const satisfies Pack;
