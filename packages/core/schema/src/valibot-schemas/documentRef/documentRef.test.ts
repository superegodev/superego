import * as v from "valibot";
import { describe, expect, it } from "vitest";
import documentRef from "./documentRef.js";

//////////////////////////////
// Test function definition //
//////////////////////////////

interface TestCase {
  collectionId?: string;
  input: any;
  expectedIssues: {
    kind: "schema" | "validation";
    message: string;
    path?: { key: string | number }[];
  }[];
}
const test = (name: string, testCase: TestCase, only?: boolean) => {
  it(name, { only: only ?? false }, () => {
    // Exercise
    const result = v.safeParse(
      documentRef(testCase.collectionId),
      testCase.input,
    );
    // Verify
    expect(result.issues ?? []).toMatchObject(testCase.expectedIssues);
  });
};
test.only = (name: string, testCase: TestCase) => test(name, testCase, true);

///////////
// Tests //
///////////

describe("Invalid DocumentRef", () => {
  test("collectionId !== documentRef.collectionId -> not valid", {
    collectionId: "collectionId",
    input: {
      collectionId: "otherCollectionId",
      documentId: "documentId",
    },
    expectedIssues: [
      {
        kind: "validation",
        message: 'Invalid DocumentRef: collectionId must be "collectionId"',
      },
    ],
  });
});

describe("Valid DocumentRef", () => {
  test("collectionId === documentRef.collectionId -> valid", {
    collectionId: "collectionId",
    input: {
      collectionId: "collectionId",
      documentId: "documentId",
    },
    expectedIssues: [],
  });

  test("collectionId === undefined -> valid", {
    collectionId: undefined,
    input: {
      collectionId: "collectionId",
      documentId: "documentId",
    },
    expectedIssues: [],
  });
});
