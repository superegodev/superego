import { DateTime } from "luxon";

export function tomorrowAt(hour: number): string {
  return DateTime.now()
    .set({ hour: hour, minute: 0, second: 0, millisecond: 0 })
    .plus({ days: 1 })
    .toUTC()
    .toISO();
}

export function nDaysAgo(days: number): string {
  return DateTime.now().minus({ days }).toUTC().toISO();
}

export function inNDays(days: number): string {
  return DateTime.now().plus({ days }).toUTC().toISO();
}
