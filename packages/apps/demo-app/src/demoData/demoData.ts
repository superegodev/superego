import calendarEntries from "./calendarEntries.js";
import collectionCategories from "./collectionCategories.js";
import contacts from "./contacts.js";
import expenses from "./expenses.js";
import foods from "./foods.js";
import fuelLogs from "./fuelLogs.js";
import meals from "./meals.js";
import type { DemoData } from "./types.js";
import weighIns from "./weighIns.js";

const demoData: DemoData = {
  collectionCategories,
  // Note: collection order matters for ProtoCollection references.
  collections: [
    calendarEntries,
    contacts,
    expenses,
    fuelLogs,
    foods,
    weighIns,
    meals,
  ],
};
export default demoData;
