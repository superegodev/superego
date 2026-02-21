import { type Pack, Theme } from "@superego/backend";
import decodeInlineBase64Asset from "../../../../../utils/decodeInlineBase64Asset.js";
import calendar from "./calendar.js";
import calendarApp from "./calendarApp.js";
import contacts from "./contacts.js";
import drawings from "./drawings.js";
import notes from "./notes.js";
import screenshot0Dark from "./screenshots/0.dark.avif?inline";
import screenshot0Light from "./screenshots/0.light.avif?inline";
import screenshot1Dark from "./screenshots/1.dark.avif?inline";
import screenshot1Light from "./screenshots/1.light.avif?inline";
import screenshot2Dark from "./screenshots/2.dark.avif?inline";
import screenshot2Light from "./screenshots/2.light.avif?inline";
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
        theme: Theme.Light,
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(screenshot0Light),
      },
      {
        theme: Theme.Dark,
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(screenshot0Dark),
      },
      {
        theme: Theme.Light,
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(screenshot1Light),
      },
      {
        theme: Theme.Dark,
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(screenshot1Dark),
      },
      {
        theme: Theme.Light,
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(screenshot2Light),
      },
      {
        theme: Theme.Dark,
        mimeType: "image/avif",
        content: decodeInlineBase64Asset(screenshot2Dark),
      },
    ],
  },
  collectionCategories: [{ name: "Productivity", icon: "🧰", parentId: null }],
  collections: [contacts, calendar, tasks, notes, drawings],
  apps: [calendarApp, tasksApp],
  documents: [],
} as const satisfies Pack;
