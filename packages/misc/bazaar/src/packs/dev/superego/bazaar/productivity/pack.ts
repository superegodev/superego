import type { Pack } from "@superego/backend";
import { Base64Url } from "@superego/shared-utils";
import calendar from "./calendar.js";
import contacts from "./contacts.js";
import cover from "./cover.png?inline";

const pack: Pack = {
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
        content: Base64Url.decodeToBytes(cover),
      },
    ],
  },
  collectionCategories: [{ name: "Productivity", icon: "🧰", parentId: null }],
  collections: [contacts, calendar],
  apps: [],
  documents: [],
};
export default pack;
