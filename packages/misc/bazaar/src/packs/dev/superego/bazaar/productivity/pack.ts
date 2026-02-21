import type { Pack } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import calendar from "./calendar.js";
import calendarApp from "./calendarApp.js";
import contacts from "./contacts.js";
import drawings from "./drawings.js";
import notes from "./notes.js";
import cover from "./screenshots/0.avif?inline";
import tasks from "./tasks.js";
import tasksApp from "./tasksApp.js";

export default {
  id: "Pack_dev.superego.bazaar.productivity",
  info: {
    name: "Productivity",
    shortDescription: "Contacts, calendar, tasks, notes, and drawings.",
    longDescription: `
A basic productivity pack to get you started:

- An address book for your personal contacts.
- A calendar for your appointments.
- A kanban board for you tasks.
- A collection of notes, because who doesn't take notes.
- And finally a collection to keep your Excalidraw drawings organized.
    `.trim(),
    screenshots: [
      {
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(cover),
      },
    ],
  },
  collectionCategories: [{ name: "Productivity", icon: "🧰", parentId: null }],
  collections: [contacts, calendar, tasks, notes, drawings],
  apps: [calendarApp, tasksApp],
  documents: [],
} as const satisfies Pack;
