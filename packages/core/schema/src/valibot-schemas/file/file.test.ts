import * as v from "valibot";
import { describe, expect, it } from "vitest";
import type { FileTypeDefinition } from "../../typeDefinitions.js";
import file from "./file.js";

//////////////////////////////
// Test function definition //
//////////////////////////////

interface TestCase {
  file: any;
  accept?: FileTypeDefinition["accept"];
  expectedIssues: {
    kind: "schema" | "validation";
    message: string;
    path?: { key: string | number }[];
  }[];
}
const test = (name: string, testCase: TestCase, only?: boolean) => {
  it(name, { only: only ?? false }, () => {
    // Exercise
    const result = v.safeParse(file(testCase.accept, "normal"), testCase.file);
    // Verify
    expect(result.issues ?? []).toMatchObject(testCase.expectedIssues);
  });
};
test.only = (name: string, testCase: TestCase) => test(name, testCase, true);

///////////
// Tests //
///////////

describe("Invalid files", () => {
  test("missing name property", {
    file: {
      mimeType: "text/plain",
    },
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid key: Expected "name" but received undefined',
      },
    ],
  });

  test("invalid mimeType", {
    file: {
      id: "id",
      name: "file.txt",
      mimeType: "notAMimeType",
    },
    expectedIssues: [
      {
        kind: "validation",
        message: 'Invalid mime type: Received "notAMimeType"',
      },
    ],
  });

  describe("unsatisfied accept", () => {
    test("case: mismatching mime type", {
      file: {
        id: "id",
        name: "file.txt",
        mimeType: "text/plain",
      },
      accept: {
        "image/*": [".txt"],
      },
      expectedIssues: [
        {
          kind: "validation",
          message: 'Invalid file: Does not satisfy "accept" constraint',
        },
      ],
    });

    test("case: non-accepted extension", {
      file: {
        id: "id",
        name: "file.txt",
        mimeType: "text/plain",
      },
      accept: {
        "text/*": [".html", ".css"],
      },
      expectedIssues: [
        {
          kind: "validation",
          message: 'Invalid file: Does not satisfy "accept" constraint',
        },
      ],
    });
  });
});

describe("Valid files", () => {
  test("no accept", {
    file: {
      id: "id",
      name: "file.txt",
      mimeType: "text/plain",
    },
    expectedIssues: [],
  });

  describe("satisfied accept", () => {
    test("case: all mime types, specific extension", {
      file: {
        id: "id",
        name: "file.txt",
        mimeType: "text/plain",
      },
      accept: {
        "*/*": [".txt"],
      },
      expectedIssues: [],
    });

    test("case: specific mime type, all extensions", {
      file: {
        id: "id",
        name: "file.txt",
        mimeType: "text/plain",
      },
      accept: {
        "text/plain": "*",
      },
      expectedIssues: [],
    });

    test("case: mime type with all subtypes, all extensions", {
      file: {
        id: "id",
        name: "file.txt",
        mimeType: "text/plain",
      },
      accept: {
        "text/*": "*",
      },
      expectedIssues: [],
    });

    test("case: specific mime type, specific extension", {
      file: {
        id: "id",
        name: "file.txt",
        mimeType: "text/plain",
      },
      accept: {
        "text/plain": [".txt"],
      },
      expectedIssues: [],
    });
  });
});
