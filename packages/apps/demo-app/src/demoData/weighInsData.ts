import type { packsAsConst } from "@superego/bazaar";
import type { TypeOf } from "@superego/schema";
import { DateTime } from "luxon";

type WeighIn = TypeOf<(typeof packsAsConst)[1]["collections"][2]["schema"]>;

export default [
  {
    timestamp: DateTime.now()
      .minus({ days: 370 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.7,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 363 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 71.0,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 349 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 71.0,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 342 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 71.2,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 335 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 71.3,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 328 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 71.1,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 321 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 71.1,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 314 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.9,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 307 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.8,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 300 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.4,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 293 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.1,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 279 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.0,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 272 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 69.9,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 244 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 69.7,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 237 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 69.6,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 223 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 69.5,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 216 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 69.6,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 209 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 69.8,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 202 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.0,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 195 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.3,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 188 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.6,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 181 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.7,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 174 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.9,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 167 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 71.0,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 139 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 71.0,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 132 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 71.0,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 125 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.9,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 118 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.8,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 104 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.9,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 97 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.5,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 90 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.5,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 83 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.5,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 76 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.2,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 69 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.0,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 62 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.2,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 55 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.2,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 41 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.4,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 34 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.6,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 27 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.5,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 20 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.8,
    scale: "Mi Scale 2",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 13 })
      .set({ hour: 7, minute: 18 })
      .toISO(),
    weightKg: 70.7,
    scale: "Mi Scale 2",
    notes: null,
  },
] satisfies WeighIn[];
