import { type Pack, Theme } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import cycleDayLogs from "./cycleDayLogs.js";
import cycleDayLogsApp from "./cycleDayLogsApp.js";
import foods from "./foods.js";
import meals from "./meals.js";
import screenshot0Dark from "./screenshots/0.dark.avif?inline";
import screenshot0Light from "./screenshots/0.light.avif?inline";
import weighIns from "./weighIns.js";

export default {
  id: "Pack_dev.superego.bazaar.health",
  info: {
    name: "Health",
    shortDescription: "Track nutrition, cycle logs, and weigh-ins.",
    longDescription: "Track nutrition, cycle logs, and weigh-ins.",
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
  collectionCategories: [{ name: "Health", icon: "🥦", parentId: null }],
  collections: [cycleDayLogs, foods, meals, weighIns],
  apps: [cycleDayLogsApp],
  documents: [],
} as const satisfies Pack;
