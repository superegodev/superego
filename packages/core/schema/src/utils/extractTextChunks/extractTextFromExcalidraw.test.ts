import { expect, it } from "vitest";
import DataType from "../../DataType.js";
import type JsonObject from "../../types/JsonObject.js";
import extractTextFromExcalidraw from "./extractTextFromExcalidraw.js";

const testCases: {
  name: string;
  input: JsonObject;
  expected: string | null;
}[] = [
  {
    name: "single text element",
    input: {
      __dataType: DataType.JsonObject,
      elements: [{ type: "text", text: "hello" }],
    },
    expected: "hello",
  },
  {
    name: "multiple text elements",
    input: {
      __dataType: DataType.JsonObject,
      elements: [
        { type: "text", text: "hello" },
        { type: "text", text: "world" },
      ],
    },
    expected: "hello world",
  },
  {
    name: "text elements mixed with non-text elements",
    input: {
      __dataType: DataType.JsonObject,
      elements: [
        { type: "rectangle", x: 0, y: 0, width: 100, height: 50 },
        { type: "text", text: "label" },
        { type: "ellipse", x: 200, y: 100, width: 80, height: 80 },
        { type: "text", text: "annotation" },
        {
          type: "arrow",
          points: [
            [0, 0],
            [100, 100],
          ],
        },
      ],
    },
    expected: "label annotation",
  },
  {
    name: "no text elements",
    input: {
      __dataType: DataType.JsonObject,
      elements: [
        { type: "rectangle", x: 0, y: 0, width: 100, height: 50 },
        { type: "ellipse", x: 200, y: 100, width: 80, height: 80 },
        { type: "diamond", x: 50, y: 50, width: 60, height: 60 },
      ],
    },
    expected: "",
  },
  {
    name: "empty elements array",
    input: {
      __dataType: DataType.JsonObject,
      elements: [],
    },
    expected: "",
  },
  {
    name: "missing elements property",
    input: {
      __dataType: DataType.JsonObject,
      appState: { viewBackgroundColor: "#ffffff" },
    },
    expected: null,
  },
  {
    name: "elements is not an array",
    input: {
      __dataType: DataType.JsonObject,
      elements: "not-an-array",
    },
    expected: null,
  },
  {
    name: "text elements with extra properties",
    input: {
      __dataType: DataType.JsonObject,
      elements: [
        {
          type: "text",
          text: "styled text",
          fontSize: 20,
          fontFamily: 1,
          textAlign: "center",
          x: 100,
          y: 200,
          strokeColor: "#000000",
          backgroundColor: "transparent",
        },
      ],
    },
    expected: "styled text",
  },
  {
    name: "element with type text but missing text property",
    input: {
      __dataType: DataType.JsonObject,
      elements: [{ type: "text" }, { type: "text", text: "valid" }],
    },
    expected: "valid",
  },
  {
    name: "element with type text but non-string text property",
    input: {
      __dataType: DataType.JsonObject,
      elements: [
        { type: "text", text: 123 },
        { type: "text", text: "valid" },
      ],
    },
    expected: "valid",
  },
  {
    name: "complex drawing with many element types",
    input: {
      __dataType: DataType.JsonObject,
      elements: [
        { type: "rectangle", x: 10, y: 10, width: 200, height: 100 },
        { type: "text", text: "Title", fontSize: 28, textAlign: "center" },
        {
          type: "line",
          points: [
            [0, 0],
            [200, 0],
          ],
        },
        { type: "text", text: "Step 1", fontSize: 16 },
        {
          type: "arrow",
          points: [
            [0, 0],
            [0, 50],
          ],
        },
        { type: "rectangle", x: 10, y: 200, width: 200, height: 100 },
        { type: "text", text: "Step 2", fontSize: 16 },
        {
          type: "freedraw",
          points: [
            [0, 0],
            [10, 5],
            [20, 0],
          ],
        },
        { type: "image", fileId: "abc123" },
      ],
    },
    expected: "Title Step 1 Step 2",
  },
];

it.each(testCases)("case: $name", ({ input, expected }) => {
  // Exercise
  const result = extractTextFromExcalidraw(input);

  // Verify
  expect(result).toEqual(expected);
});
