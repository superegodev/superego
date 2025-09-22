import { describe, expect, it } from "vitest";
import parsePath, { type PathSegment } from "./parsePath.js";

describe("parses a path into segments", () => {
  const testCases: {
    path: string;
    expectedSegments: PathSegment[];
  }[] = [
    { path: "", expectedSegments: [] },
    {
      path: "a.b",
      expectedSegments: [
        { type: "StructProperty", value: "a" },
        { type: "StructProperty", value: "b" },
      ],
    },
    {
      path: "[a][b]",
      expectedSegments: [
        { type: "StructProperty", value: "a" },
        { type: "StructProperty", value: "b" },
      ],
    },
    {
      path: '["a"]["b"]',
      expectedSegments: [
        { type: "StructProperty", value: "a" },
        { type: "StructProperty", value: "b" },
      ],
    },
    {
      path: "[0]",
      expectedSegments: [{ type: "ListItem", value: "0" }],
    },
    {
      path: "a[0]",
      expectedSegments: [
        { type: "StructProperty", value: "a" },
        { type: "ListItem", value: "0" },
      ],
    },
    {
      path: "a[0][0]",
      expectedSegments: [
        { type: "StructProperty", value: "a" },
        { type: "ListItem", value: "0" },
        { type: "ListItem", value: "0" },
      ],
    },
  ];
  it.each(testCases)("case: $path", ({ path, expectedSegments }) => {
    // Exercise
    const segments = parsePath(path);

    // Verify
    expect(segments).toEqual(expectedSegments);
  });
});
