import type { Pack } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import calendar from "./calendar.js";
import calendarApp from "./calendarApp.js";
import contacts from "./contacts.js";
import drawings from "./drawings.js";
import cover from "./screenshots/0.avif?inline";

export default {
  id: "Pack_dev.superego.bazaar.productivity",
  info: {
    name: "Productivity",
    shortDescription: "Contacts manager and calendar.",
    longDescription:
      "A simple address book for your personal contacts, and a simple calendar for your appointments.",
    screenshots: [
      {
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(cover),
      },
    ],
  },
  collectionCategories: [{ name: "Productivity", icon: "🧰", parentId: null }],
  collections: [contacts, calendar, drawings],
  apps: [calendarApp],
  documents: [],
} as const satisfies Pack;
