import type { Pack } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import calendar from "./calendar.js";
import contacts from "./contacts.js";
import cover from "./cover.avif?inline";

export default {
  id: "Pack_dev.superego.productivity",
  info: {
    name: "Productivity",
    coverImage: "cover.avif",
    shortDescription: "Contacts manager and calendar.",
    longDescription:
      "A simple address book for your personal contacts, and a simple calendar for your appointments.",
    images: [
      {
        path: "cover.avif",
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(cover),
      },
    ],
  },
  collectionCategories: [{ name: "Productivity", icon: "🧰", parentId: null }],
  collections: [contacts, calendar],
  apps: [],
  documents: [],
} as const satisfies Pack;
