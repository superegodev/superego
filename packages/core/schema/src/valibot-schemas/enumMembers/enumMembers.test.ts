import * as v from "valibot";
import { describe, expect, it } from "vitest";
import enumMembers from "./enumMembers.js";

//////////////////////////////
// Test function definition //
//////////////////////////////

interface TestCase {
  members: any;
  expectedIssues: {
    kind: "schema" | "validation";
    message: string;
    path?: { key: string | number }[];
  }[];
}
const test = (name: string, testCase: TestCase, only?: boolean) => {
  it(name, { only: only ?? false }, () => {
    // Exercise
    const result = v.safeParse(enumMembers(), testCase.members);
    // Verify
    expect(result.issues ?? []).toMatchObject(testCase.expectedIssues);
  });
};
test.only = (name: string, testCase: TestCase) => test(name, testCase, true);

///////////
// Tests //
///////////

describe("Invalid enum members", () => {
  test("invalid member identifier", {
    members: {
      "0Member": { value: "0Member" },
    },
    expectedIssues: [
      {
        kind: "validation",
        message:
          'Invalid identifier: Should match /^[a-zA-Z_$][a-zA-Z0-9_$]{0,127}$/ but received "0Member"',
        path: [{ key: "0Member" }],
      },
    ],
  });

  test("no members", {
    members: {},
    expectedIssues: [
      {
        kind: "validation",
        message: "Invalid entries: Expected >=1 but received 0",
      },
    ],
  });

  test("non-unique member values", {
    members: {
      one: { value: "one" },
      two: { value: "one" },
    },
    expectedIssues: [
      {
        kind: "validation",
        message: "Invalid members: Values must be unique",
      },
    ],
  });
});

describe("Valid enum members", () => {
  test("Valid enum members", {
    members: {
      one: { value: "one" },
      two: { value: "two" },
    },
    expectedIssues: [],
  });
});
