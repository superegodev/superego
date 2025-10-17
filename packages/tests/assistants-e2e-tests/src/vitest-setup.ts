import { DateTime } from "luxon";
import { expect } from "vitest";

expect.extend({
  instantEquivalentTo(received: unknown, instant: string) {
    const receivedTime =
      typeof received === "string" ? Date.parse(received) : Number.NaN;

    const pass =
      Number.isFinite(receivedTime) && receivedTime === Date.parse(instant);

    return {
      pass,
      message: () =>
        [
          "expected ",
          this.utils.printReceived(received),
          pass ? " not " : " ",
          `to be equivalent to ${instant}`,
        ].join(""),
    };
  },

  instantCloseToNow(received: unknown, threshold: number) {
    const receivedTime =
      typeof received === "string" ? Date.parse(received) : Number.NaN;

    const pass =
      Number.isFinite(receivedTime) &&
      Math.abs(receivedTime - Date.now()) <= threshold;

    return {
      pass,
      message: () =>
        [
          "expected ",
          this.utils.printReceived(received),
          pass ? " not " : " ",
          `to be within ${threshold}ms of now`,
        ].join(""),
    };
  },

  todaysPlainDate(received: unknown) {
    // TODO: account for the edge case in which the test is run around midnight.
    // The document is created the day before, but the assertion runs the day
    // after, making it incorrect.
    const today = DateTime.now().toLocal().toISODate();

    const pass = received === today;

    return {
      pass,
      message: () =>
        [
          "expected ",
          this.utils.printReceived(received),
          pass ? " not " : " ",
          `to be ${today} (today)`,
        ].join(""),
    };
  },
});

interface CustomMatchers<R = unknown> {
  instantEquivalentTo(instant: string): R;
  instantCloseToNow(threshold: number): R;
  todaysPlainDate(): R;
}

declare module "vitest" {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}
