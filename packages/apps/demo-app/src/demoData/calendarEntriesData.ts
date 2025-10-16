import type { TypeOf } from "@superego/schema";
import { DateTime } from "luxon";
import type calendarEntriesSchema from "./calendarEntriesSchema.js";

export default [
  {
    type: "Event",
    title: "Milan visit",
    startTime: DateTime.now()
      .plus({ months: -11 })
      .set({ day: 6 })
      .startOf("day")
      .set({ hour: 8, minute: 20 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -11 })
      .set({ day: 6 })
      .startOf("day")
      .plus({ days: 7 })
      .set({ hour: 21, minute: 45 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Breakfast with Giulia at Pavé",
    startTime: DateTime.now()
      .plus({ months: -11 })
      .set({ day: 6 })
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 10, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -11 })
      .set({ day: 6 })
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 10, minute: 0 })
      .plus({ minutes: 90 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Dinner with Marco and Elisa",
    startTime: DateTime.now()
      .plus({ months: -11 })
      .set({ day: 6 })
      .startOf("day")
      .plus({ days: 3 })
      .set({ hour: 19, minute: 30 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -11 })
      .set({ day: 6 })
      .startOf("day")
      .plus({ days: 3 })
      .set({ hour: 19, minute: 30 })
      .plus({ minutes: 150 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Coffee with Andrea near Duomo",
    startTime: DateTime.now()
      .plus({ months: -11 })
      .set({ day: 6 })
      .startOf("day")
      .plus({ days: 5 })
      .set({ hour: 15, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -11 })
      .set({ day: 6 })
      .startOf("day")
      .plus({ days: 5 })
      .set({ hour: 15, minute: 0 })
      .plus({ minutes: 90 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Turin visit",
    startTime: DateTime.now()
      .plus({ months: -9 })
      .set({ day: 9 })
      .startOf("day")
      .set({ hour: 8, minute: 20 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -9 })
      .set({ day: 9 })
      .startOf("day")
      .plus({ days: 7 })
      .set({ hour: 21, minute: 45 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Espresso with Carlo on Via Po",
    startTime: DateTime.now()
      .plus({ months: -9 })
      .set({ day: 9 })
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 9, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -9 })
      .set({ day: 9 })
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 9, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Lunch with Paolo at Mercato Centrale",
    startTime: DateTime.now()
      .plus({ months: -9 })
      .set({ day: 9 })
      .startOf("day")
      .plus({ days: 3 })
      .set({ hour: 13, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -9 })
      .set({ day: 9 })
      .startOf("day")
      .plus({ days: 3 })
      .set({ hour: 13, minute: 0 })
      .plus({ minutes: 90 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Aperitivo with Martina and Luca",
    startTime: DateTime.now()
      .plus({ months: -9 })
      .set({ day: 9 })
      .startOf("day")
      .plus({ days: 5 })
      .set({ hour: 20, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -9 })
      .set({ day: 9 })
      .startOf("day")
      .plus({ days: 5 })
      .set({ hour: 20, minute: 0 })
      .plus({ minutes: 120 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Rome visit",
    startTime: DateTime.now()
      .plus({ months: -7 })
      .set({ day: 6 })
      .startOf("day")
      .set({ hour: 8, minute: 20 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -7 })
      .set({ day: 6 })
      .startOf("day")
      .plus({ days: 7 })
      .set({ hour: 21, minute: 45 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Morning cornetto with Silvia",
    startTime: DateTime.now()
      .plus({ months: -7 })
      .set({ day: 6 })
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 8, minute: 30 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -7 })
      .set({ day: 6 })
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 8, minute: 30 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Lunch with Fabio in Trastevere",
    startTime: DateTime.now()
      .plus({ months: -7 })
      .set({ day: 6 })
      .startOf("day")
      .plus({ days: 3 })
      .set({ hour: 12, minute: 30 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -7 })
      .set({ day: 6 })
      .startOf("day")
      .plus({ days: 3 })
      .set({ hour: 12, minute: 30 })
      .plus({ minutes: 90 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Dinner with Chiara overlooking the Tiber",
    startTime: DateTime.now()
      .plus({ months: -7 })
      .set({ day: 6 })
      .startOf("day")
      .plus({ days: 5 })
      .set({ hour: 19, minute: 15 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -7 })
      .set({ day: 6 })
      .startOf("day")
      .plus({ days: 5 })
      .set({ hour: 19, minute: 15 })
      .plus({ minutes: 150 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Puglia visit",
    startTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .set({ hour: 8, minute: 20 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 21 })
      .set({ hour: 21, minute: 45 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Breakfast with cousins in Bari Vecchia",
    startTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 9, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 9, minute: 0 })
      .plus({ minutes: 90 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Seafood dinner with Antonio in Monopoli",
    startTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 3 })
      .set({ hour: 20, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 3 })
      .set({ hour: 20, minute: 0 })
      .plus({ minutes: 150 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Beach coffee with Federica in Polignano",
    startTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 6 })
      .set({ hour: 11, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 6 })
      .set({ hour: 11, minute: 0 })
      .plus({ minutes: 90 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Pizza night with high school friends",
    startTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 9 })
      .set({ hour: 19, minute: 30 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 9 })
      .set({ hour: 19, minute: 30 })
      .plus({ minutes: 150 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Brunch with Sara in Lecce",
    startTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 12 })
      .set({ hour: 10, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 12 })
      .set({ hour: 10, minute: 0 })
      .plus({ minutes: 120 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Sunset aperitivo in Ostuni",
    startTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 15 })
      .set({ hour: 18, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 15 })
      .set({ hour: 18, minute: 0 })
      .plus({ minutes: 120 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Long lunch with grandparents",
    startTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 18 })
      .set({ hour: 13, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 14 })
      .startOf("day")
      .plus({ days: 18 })
      .set({ hour: 13, minute: 0 })
      .plus({ minutes: 150 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Florence visit",
    startTime: DateTime.now()
      .plus({ months: -3 })
      .set({ day: 8 })
      .startOf("day")
      .set({ hour: 8, minute: 20 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -3 })
      .set({ day: 8 })
      .startOf("day")
      .plus({ days: 7 })
      .set({ hour: 21, minute: 45 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Coffee with Daniele at Ditta Artigianale",
    startTime: DateTime.now()
      .plus({ months: -3 })
      .set({ day: 8 })
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 9, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -3 })
      .set({ day: 8 })
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 9, minute: 0 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Osteria lunch with Chiara and Marta",
    startTime: DateTime.now()
      .plus({ months: -3 })
      .set({ day: 8 })
      .startOf("day")
      .plus({ days: 3 })
      .set({ hour: 13, minute: 15 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -3 })
      .set({ day: 8 })
      .startOf("day")
      .plus({ days: 3 })
      .set({ hour: 13, minute: 15 })
      .plus({ minutes: 120 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Wine bar evening with Lorenzo",
    startTime: DateTime.now()
      .plus({ months: -3 })
      .set({ day: 8 })
      .startOf("day")
      .plus({ days: 5 })
      .set({ hour: 18, minute: 45 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -3 })
      .set({ day: 8 })
      .startOf("day")
      .plus({ days: 5 })
      .set({ hour: 18, minute: 45 })
      .plus({ minutes: 150 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Milan visit",
    startTime: DateTime.now()
      .plus({ months: -1 })
      .set({ day: 10 })
      .startOf("day")
      .set({ hour: 8, minute: 20 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -1 })
      .set({ day: 10 })
      .startOf("day")
      .plus({ days: 7 })
      .set({ hour: 21, minute: 45 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Run and cappuccino with Nicola in Parco Sempione",
    startTime: DateTime.now()
      .plus({ months: -1 })
      .set({ day: 10 })
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 8, minute: 30 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -1 })
      .set({ day: 10 })
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 8, minute: 30 })
      .plus({ minutes: 90 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Lunch with Francesca at Eataly",
    startTime: DateTime.now()
      .plus({ months: -1 })
      .set({ day: 10 })
      .startOf("day")
      .plus({ days: 3 })
      .set({ hour: 12, minute: 30 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -1 })
      .set({ day: 10 })
      .startOf("day")
      .plus({ days: 3 })
      .set({ hour: 12, minute: 30 })
      .plus({ minutes: 90 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Dinner with Davide and crew in Porta Romana",
    startTime: DateTime.now()
      .plus({ months: -1 })
      .set({ day: 10 })
      .startOf("day")
      .plus({ days: 5 })
      .set({ hour: 20, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -1 })
      .set({ day: 10 })
      .startOf("day")
      .plus({ days: 5 })
      .set({ hour: 20, minute: 0 })
      .plus({ minutes: 150 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Rome visit",
    startTime: DateTime.now()
      .plus({ months: 1 })
      .set({ day: 18 })
      .startOf("day")
      .set({ hour: 8, minute: 20 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: 1 })
      .set({ day: 18 })
      .startOf("day")
      .plus({ days: 7 })
      .set({ hour: 21, minute: 45 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Coffee with Matteo near the Colosseum",
    startTime: DateTime.now()
      .plus({ months: 1 })
      .set({ day: 18 })
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 9, minute: 15 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: 1 })
      .set({ day: 18 })
      .startOf("day")
      .plus({ days: 1 })
      .set({ hour: 9, minute: 15 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Lunch with cousins in Testaccio",
    startTime: DateTime.now()
      .plus({ months: 1 })
      .set({ day: 18 })
      .startOf("day")
      .plus({ days: 3 })
      .set({ hour: 14, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: 1 })
      .set({ day: 18 })
      .startOf("day")
      .plus({ days: 3 })
      .set({ hour: 14, minute: 0 })
      .plus({ minutes: 120 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Dinner with Giulia and Riccardo",
    startTime: DateTime.now()
      .plus({ months: 1 })
      .set({ day: 18 })
      .startOf("day")
      .plus({ days: 5 })
      .set({ hour: 20, minute: 30 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: 1 })
      .set({ day: 18 })
      .startOf("day")
      .plus({ days: 5 })
      .set({ hour: 20, minute: 30 })
      .plus({ minutes: 150 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "SE Asia adventure",
    startTime: DateTime.now()
      .plus({ months: -8 })
      .set({ day: 3 })
      .startOf("day")
      .set({ hour: 7, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -8 })
      .set({ day: 3 })
      .startOf("day")
      .plus({ days: 21 })
      .set({ hour: 22, minute: 0 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Chiang Mai cooking class",
    startTime: DateTime.now()
      .plus({ months: -8 })
      .set({ day: 3 })
      .startOf("day")
      .plus({ days: 4 })
      .set({ hour: 9, minute: 30 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -8 })
      .set({ day: 3 })
      .startOf("day")
      .plus({ days: 4 })
      .set({ hour: 9, minute: 30 })
      .plus({ minutes: 180 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Puglia summer break",
    startTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 10 })
      .startOf("day")
      .set({ hour: 7, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 10 })
      .startOf("day")
      .plus({ days: 21 })
      .set({ hour: 22, minute: 0 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Sunset swim in Polignano a Mare",
    startTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 10 })
      .startOf("day")
      .plus({ days: 2 })
      .set({ hour: 18, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 10 })
      .startOf("day")
      .plus({ days: 2 })
      .set({ hour: 18, minute: 0 })
      .plus({ minutes: 120 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "USA road trip",
    startTime: DateTime.now()
      .plus({ months: 0 })
      .set({ day: 21 })
      .startOf("day")
      .set({ hour: 7, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: 0 })
      .set({ day: 21 })
      .startOf("day")
      .plus({ days: 21 })
      .set({ hour: 22, minute: 0 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Brooklyn brunch with college friends",
    startTime: DateTime.now()
      .plus({ months: 0 })
      .set({ day: 21 })
      .startOf("day")
      .plus({ days: 5 })
      .set({ hour: 9, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: 0 })
      .set({ day: 21 })
      .startOf("day")
      .plus({ days: 5 })
      .set({ hour: 9, minute: 0 })
      .plus({ minutes: 150 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Deep tissue massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 2 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 2 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Relaxing massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 3 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 3 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Deep tissue massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 4 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 4 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Relaxing massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 5 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 5 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Deep tissue massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 6 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 6 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Relaxing massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 8 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 8 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Deep tissue massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 9 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 9 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Relaxing massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 10 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 10 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Deep tissue massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 11 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 11 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Relaxing massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 12 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 12 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Deep tissue massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 13 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 13 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Relaxing massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 14 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 14 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Deep tissue massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 15 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 15 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Relaxing massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 17 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 17 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Deep tissue massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 18 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 18 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Relaxing massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 19 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 19 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Deep tissue massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 20 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 20 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Relaxing massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 21 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 21 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Deep tissue massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 25 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 25 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Relaxing massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 27 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 27 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Deep tissue massage",
    startTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 28 })
      .toISO(),
    endTime: DateTime.now()
      .minus({ months: 5 })
      .startOf("week")
      .set({ weekday: 3, hour: 18, minute: 30 })
      .plus({ weeks: 28 })
      .plus({ minutes: 75 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: -12 })
      .set({ day: 4 })
      .set({ hour: 20, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -12 })
      .set({ day: 4 })
      .set({ hour: 20, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: -12 })
      .set({ day: 18 })
      .set({ hour: 21, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -12 })
      .set({ day: 18 })
      .set({ hour: 21, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: -10 })
      .set({ day: 6 })
      .set({ hour: 20, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -10 })
      .set({ day: 6 })
      .set({ hour: 20, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: -10 })
      .set({ day: 20 })
      .set({ hour: 21, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -10 })
      .set({ day: 20 })
      .set({ hour: 21, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: -8 })
      .set({ day: 2 })
      .set({ hour: 20, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -8 })
      .set({ day: 2 })
      .set({ hour: 20, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: -8 })
      .set({ day: 25 })
      .set({ hour: 21, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -8 })
      .set({ day: 25 })
      .set({ hour: 21, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: -6 })
      .set({ day: 5 })
      .set({ hour: 20, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -6 })
      .set({ day: 5 })
      .set({ hour: 20, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: -6 })
      .set({ day: 19 })
      .set({ hour: 21, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -6 })
      .set({ day: 19 })
      .set({ hour: 21, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: -4 })
      .set({ day: 7 })
      .set({ hour: 20, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -4 })
      .set({ day: 7 })
      .set({ hour: 20, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: -4 })
      .set({ day: 23 })
      .set({ hour: 21, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -4 })
      .set({ day: 23 })
      .set({ hour: 21, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: -2 })
      .set({ day: 9 })
      .set({ hour: 20, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -2 })
      .set({ day: 9 })
      .set({ hour: 20, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: -2 })
      .set({ day: 24 })
      .set({ hour: 21, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -2 })
      .set({ day: 24 })
      .set({ hour: 21, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: -1 })
      .set({ day: 4 })
      .set({ hour: 20, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -1 })
      .set({ day: 4 })
      .set({ hour: 20, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: -1 })
      .set({ day: 28 })
      .set({ hour: 21, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -1 })
      .set({ day: 28 })
      .set({ hour: 21, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: 0 })
      .set({ day: 3 })
      .set({ hour: 20, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: 0 })
      .set({ day: 3 })
      .set({ hour: 20, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: 0 })
      .set({ day: 17 })
      .set({ hour: 21, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: 0 })
      .set({ day: 17 })
      .set({ hour: 21, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: 2 })
      .set({ day: 8 })
      .set({ hour: 20, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: 2 })
      .set({ day: 8 })
      .set({ hour: 20, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Video call with Italian friends",
    startTime: DateTime.now()
      .plus({ months: 2 })
      .set({ day: 22 })
      .set({ hour: 21, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: 2 })
      .set({ day: 22 })
      .set({ hour: 21, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Brunch with Tomas at StrangeLove",
    startTime: DateTime.now()
      .plus({ months: -12 })
      .set({ day: 12 })
      .set({ hour: 11, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -12 })
      .set({ day: 12 })
      .set({ hour: 11, minute: 0 })
      .plus({ minutes: 120 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Craft beer night with Jonas",
    startTime: DateTime.now()
      .plus({ months: -11 })
      .set({ day: 24 })
      .set({ hour: 19, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -11 })
      .set({ day: 24 })
      .set({ hour: 19, minute: 0 })
      .plus({ minutes: 150 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Game night at Milda's place",
    startTime: DateTime.now()
      .plus({ months: -10 })
      .set({ day: 15 })
      .set({ hour: 18, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -10 })
      .set({ day: 15 })
      .set({ hour: 18, minute: 0 })
      .plus({ minutes: 180 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Sunday hike with Ruta",
    startTime: DateTime.now()
      .plus({ months: -9 })
      .set({ day: 26 })
      .set({ hour: 12, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -9 })
      .set({ day: 26 })
      .set({ hour: 12, minute: 0 })
      .plus({ minutes: 240 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Breakfast with coworker Dainius",
    startTime: DateTime.now()
      .plus({ months: -8 })
      .set({ day: 1 })
      .set({ hour: 8, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -8 })
      .set({ day: 1 })
      .set({ hour: 8, minute: 0 })
      .plus({ minutes: 90 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Dinner with Agne and Tomas",
    startTime: DateTime.now()
      .plus({ months: -7 })
      .set({ day: 22 })
      .set({ hour: 19, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -7 })
      .set({ day: 22 })
      .set({ hour: 19, minute: 0 })
      .plus({ minutes: 150 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Vilnius board game evening",
    startTime: DateTime.now()
      .plus({ months: -6 })
      .set({ day: 16 })
      .set({ hour: 18, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -6 })
      .set({ day: 16 })
      .set({ hour: 18, minute: 0 })
      .plus({ minutes: 180 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Picnic at Vingis Park",
    startTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 25 })
      .set({ hour: 13, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 25 })
      .set({ hour: 13, minute: 0 })
      .plus({ minutes: 210 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Concert with Jurga",
    startTime: DateTime.now()
      .plus({ months: -4 })
      .set({ day: 21 })
      .set({ hour: 19, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -4 })
      .set({ day: 21 })
      .set({ hour: 19, minute: 0 })
      .plus({ minutes: 150 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Coffee walk with Mantas",
    startTime: DateTime.now()
      .plus({ months: -3 })
      .set({ day: 27 })
      .set({ hour: 10, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -3 })
      .set({ day: 27 })
      .set({ hour: 10, minute: 0 })
      .plus({ minutes: 90 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Dinner at new trattoria",
    startTime: DateTime.now()
      .plus({ months: -2 })
      .set({ day: 18 })
      .set({ hour: 19, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -2 })
      .set({ day: 18 })
      .set({ hour: 19, minute: 0 })
      .plus({ minutes: 150 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Future lunch with coworkers",
    startTime: DateTime.now()
      .plus({ months: 1 })
      .set({ day: 12 })
      .set({ hour: 12, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: 1 })
      .set({ day: 12 })
      .set({ hour: 12, minute: 0 })
      .plus({ minutes: 90 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "General practitioner check-up",
    startTime: DateTime.now()
      .plus({ months: -11 })
      .set({ day: 18 })
      .set({ hour: 15, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -11 })
      .set({ day: 18 })
      .set({ hour: 15, minute: 0 })
      .plus({ minutes: 30 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Dermatologist follow-up",
    startTime: DateTime.now()
      .plus({ months: -9 })
      .set({ day: 3 })
      .set({ hour: 9, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -9 })
      .set({ day: 3 })
      .set({ hour: 9, minute: 0 })
      .plus({ minutes: 30 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Physiotherapy session",
    startTime: DateTime.now()
      .plus({ months: -7 })
      .set({ day: 18 })
      .set({ hour: 14, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -7 })
      .set({ day: 18 })
      .set({ hour: 14, minute: 0 })
      .plus({ minutes: 45 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Dental cleaning",
    startTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 5 })
      .set({ hour: 8, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -5 })
      .set({ day: 5 })
      .set({ hour: 8, minute: 0 })
      .plus({ minutes: 45 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Eye exam",
    startTime: DateTime.now()
      .plus({ months: -2 })
      .set({ day: 7 })
      .set({ hour: 16, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -2 })
      .set({ day: 7 })
      .set({ hour: 16, minute: 0 })
      .plus({ minutes: 45 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Cardio check before USA trip",
    startTime: DateTime.now()
      .plus({ months: 0 })
      .set({ day: 9 })
      .set({ hour: 10, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: 0 })
      .set({ day: 9 })
      .set({ hour: 10, minute: 0 })
      .plus({ minutes: 40 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Vet visit for cat vaccination",
    startTime: DateTime.now()
      .plus({ months: -10 })
      .set({ day: 11 })
      .set({ hour: 17, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -10 })
      .set({ day: 11 })
      .set({ hour: 17, minute: 0 })
      .plus({ minutes: 30 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Cat dental check",
    startTime: DateTime.now()
      .plus({ months: -8 })
      .set({ day: 14 })
      .set({ hour: 10, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -8 })
      .set({ day: 14 })
      .set({ hour: 10, minute: 0 })
      .plus({ minutes: 45 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Routine vet check-up",
    startTime: DateTime.now()
      .plus({ months: -6 })
      .set({ day: 2 })
      .set({ hour: 18, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -6 })
      .set({ day: 2 })
      .set({ hour: 18, minute: 0 })
      .plus({ minutes: 30 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Vet visit for allergy follow-up",
    startTime: DateTime.now()
      .plus({ months: -3 })
      .set({ day: 20 })
      .set({ hour: 9, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -3 })
      .set({ day: 20 })
      .set({ hour: 9, minute: 0 })
      .plus({ minutes: 40 })
      .toISO(),
    notes: null,
  },
  {
    type: "Event",
    title: "Cat grooming appointment",
    startTime: DateTime.now()
      .plus({ months: -1 })
      .set({ day: 28 })
      .set({ hour: 16, minute: 0 })
      .toISO(),
    endTime: DateTime.now()
      .plus({ months: -1 })
      .set({ day: 28 })
      .set({ hour: 16, minute: 0 })
      .plus({ minutes: 60 })
      .toISO(),
    notes: null,
  },
] satisfies TypeOf<typeof calendarEntriesSchema>[];
