import type { JsonObject } from "@superego/schema";
import { DateTime } from "luxon";

type FuelType = "G95E5" | "G95E10" | "G98E5" | "G98E10";
interface FuelLog {
  timestamp: string;
  odometer: number;
  liters: number;
  totalCost: number;
  fullTank: boolean;
  fuelType: FuelType | null;
  notes: JsonObject | null;
}
export default [
  {
    timestamp: DateTime.now()
      .minus({ days: 349 })
      .set({ hour: 14, minute: 15 })
      .toISO(),
    odometer: 65843.8,
    liters: 53.99,
    totalCost: 77.21,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 335 })
      .set({ hour: 17, minute: 22 })
      .toISO(),
    odometer: 66512.9,
    liters: 52.61,
    totalCost: 74.8,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 321 })
      .set({ hour: 20, minute: 29 })
      .toISO(),
    odometer: 67166.3,
    liters: 53.84,
    totalCost: 76.78,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 305 })
      .set({ hour: 23, minute: 36 })
      .toISO(),
    odometer: 67833.9,
    liters: 54.8,
    totalCost: 75.08,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 294 })
      .set({ hour: 14, minute: 43 })
      .toISO(),
    odometer: 68548.9,
    liters: 53.87,
    totalCost: 75.05,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 282 })
      .set({ hour: 17, minute: 50 })
      .toISO(),
    odometer: 69171.1,
    liters: 56.14,
    totalCost: 77.13,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 268 })
      .set({ hour: 20, minute: 57 })
      .toISO(),
    odometer: 69834.4,
    liters: 55.5,
    totalCost: 76.15,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 251 })
      .set({ hour: 23, minute: 4 })
      .toISO(),
    odometer: 70522.2,
    liters: 57.28,
    totalCost: 79.2,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 240 })
      .set({ hour: 14, minute: 11 })
      .toISO(),
    odometer: 71203.9,
    liters: 57.46,
    totalCost: 81.43,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 228 })
      .set({ hour: 17, minute: 18 })
      .toISO(),
    odometer: 71899.8,
    liters: 52.16,
    totalCost: 72.22,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 214 })
      .set({ hour: 20, minute: 25 })
      .toISO(),
    odometer: 72521.2,
    liters: 57,
    totalCost: 80.29,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 197 })
      .set({ hour: 23, minute: 32 })
      .toISO(),
    odometer: 73187,
    liters: 55.35,
    totalCost: 77.05,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 187 })
      .set({ hour: 14, minute: 39 })
      .toISO(),
    odometer: 73880.5,
    liters: 53.33,
    totalCost: 72.53,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 173 })
      .set({ hour: 17, minute: 46 })
      .toISO(),
    odometer: 74583,
    liters: 53.01,
    totalCost: 73.83,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 158 })
      .set({ hour: 20, minute: 53 })
      .toISO(),
    odometer: 75288.7,
    liters: 54.03,
    totalCost: 73.02,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 141 })
      .set({ hour: 23, minute: 0 })
      .toISO(),
    odometer: 75954.6,
    liters: 57.66,
    totalCost: 82.06,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 130 })
      .set({ hour: 14, minute: 7 })
      .toISO(),
    odometer: 76619.5,
    liters: 57.88,
    totalCost: 81.19,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 116 })
      .set({ hour: 17, minute: 14 })
      .toISO(),
    odometer: 77317.3,
    liters: 53.72,
    totalCost: 76.97,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 101 })
      .set({ hour: 20, minute: 21 })
      .toISO(),
    odometer: 78026.9,
    liters: 57.61,
    totalCost: 79.3,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 84 })
      .set({ hour: 23, minute: 28 })
      .toISO(),
    odometer: 78716.8,
    liters: 55.84,
    totalCost: 79.77,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 73 })
      .set({ hour: 14, minute: 35 })
      .toISO(),
    odometer: 79361.6,
    liters: 53.29,
    totalCost: 74.13,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 60 })
      .set({ hour: 17, minute: 42 })
      .toISO(),
    odometer: 80019,
    liters: 52.77,
    totalCost: 74.94,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 45 })
      .set({ hour: 20, minute: 49 })
      .toISO(),
    odometer: 80681.7,
    liters: 56.57,
    totalCost: 78.38,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 28 })
      .set({ hour: 23, minute: 56 })
      .toISO(),
    odometer: 81394,
    liters: 54.93,
    totalCost: 76.28,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 16 })
      .set({ hour: 14, minute: 3 })
      .toISO(),
    odometer: 82099.9,
    liters: 57.02,
    totalCost: 79.81,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
  {
    timestamp: DateTime.now()
      .minus({ days: 3 })
      .set({ hour: 17, minute: 10 })
      .toISO(),
    odometer: 82744.8,
    liters: 57.43,
    totalCost: 77.72,
    fullTank: true,
    fuelType: "G95E5",
    notes: null,
  },
] satisfies FuelLog[];
