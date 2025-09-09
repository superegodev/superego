import { expect } from "vitest";

expect.extend({
  closeToNow(received: unknown, threshold: number) {
    const receivedTime =
      typeof received === "string"
        ? Date.parse(received)
        : received instanceof Date
          ? received.getTime()
          : typeof received === "number"
            ? received
            : Number.NaN;

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
});

declare module "vitest" {
  interface Assertion {
    closeToNow(ms: number): void;
  }
  interface AsymmetricMatchersContaining {
    closeToNow(ms: number): void;
  }
}
