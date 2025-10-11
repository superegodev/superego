import { Id } from "@superego/shared-utils";
import { lowerFirst } from "es-toolkit";
import { expect } from "vitest";

expect.extend({
  dateCloseToNow(received: unknown, threshold = 1_000) {
    const pass =
      received instanceof Date &&
      Math.abs(received.getTime() - Date.now()) <= threshold;

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

  id(
    received: unknown,
    type:
      | "CollectionCategory"
      | "Collection"
      | "CollectionVersion"
      | "Document"
      | "DocumentVersion"
      | "File"
      | "Conversation"
      | "BackgroundJob",
  ) {
    const method = lowerFirst(type) as keyof (typeof Id)["is"];
    const pass = Id.is[method](received);
    return {
      pass,
      message: () =>
        [
          "expected ",
          this.utils.printReceived(received),
          pass ? " not " : " ",
          `to be a ${type} id`,
        ].join(""),
    };
  },
});

interface CustomMatchers<R = unknown> {
  dateCloseToNow(threshold?: number): R;
  id(
    type:
      | "CollectionCategory"
      | "Collection"
      | "CollectionVersion"
      | "Document"
      | "DocumentVersion"
      | "File"
      | "Conversation"
      | "BackgroundJob",
  ): R;
}

declare module "vitest" {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}
