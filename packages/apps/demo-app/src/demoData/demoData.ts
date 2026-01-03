import calendarEntries from "./calendarEntries.js";
import collectionCategories from "./collectionCategories.js";
import contacts from "./contacts.js";
import expenses from "./expenses.js";
import fuelLogs from "./fuelLogs.js";
import type { DemoData } from "./types.js";
import weighIns from "./weighIns.js";

const demoData: DemoData = {
  collectionCategories,
  collections: [calendarEntries, contacts, expenses, fuelLogs, weighIns],
};
export default demoData;
