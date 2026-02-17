import { expect, it } from "vitest";
import DataType from "../../DataType.js";
import type JsonObject from "../../types/JsonObject.js";
import extractTextFromTiptap from "./extractTextFromTiptap.js";

const testCases: {
  name: string;
  input: JsonObject;
  expected: string;
}[] = [
  {
    name: "paragraph",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "A simple paragraph." }],
        },
      ],
    },
    expected: "A simple paragraph.",
  },
  {
    name: "multiple paragraphs",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "First paragraph." }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Second paragraph." }],
        },
      ],
    },
    expected: "First paragraph. Second paragraph.",
  },
  {
    name: "heading",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Main Title" }],
        },
      ],
    },
    expected: "Main Title",
  },
  {
    name: "heading followed by paragraph",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Section Title" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Section content here." }],
        },
      ],
    },
    expected: "Section Title Section content here.",
  },
  {
    name: "blockquote",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "To be or not to be." }],
            },
          ],
        },
      ],
    },
    expected: "To be or not to be.",
  },
  {
    name: "blockquote with multiple paragraphs",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "First quoted line." }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Second quoted line." }],
            },
          ],
        },
      ],
    },
    expected: "First quoted line. Second quoted line.",
  },
  {
    name: "bullet list",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Apples" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Bananas" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Cherries" }],
                },
              ],
            },
          ],
        },
      ],
    },
    expected: "Apples Bananas Cherries",
  },
  {
    name: "ordered list",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "First step" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Second step" }],
                },
              ],
            },
          ],
        },
      ],
    },
    expected: "First step Second step",
  },
  {
    name: "code block",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "codeBlock",
          content: [
            {
              type: "text",
              text: "const x = 1;\nconst y = 2;",
            },
          ],
        },
      ],
    },
    expected: "const x = 1;\nconst y = 2;",
  },
  {
    name: "horizontal rule between paragraphs",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Above the line." }],
        },
        { type: "horizontalRule" },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Below the line." }],
        },
      ],
    },
    expected: "Above the line. Below the line.",
  },
  {
    name: "hard break",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Line one" },
            { type: "hardBreak" },
            { type: "text", text: "Line two" },
          ],
        },
      ],
    },
    expected: "Line one Line two",
  },
  {
    name: "bold text",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "This is " },
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "bold",
            },
            { type: "text", text: " text." },
          ],
        },
      ],
    },
    expected: "This is bold text.",
  },
  {
    name: "italic text",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "This is " },
            {
              type: "text",
              marks: [{ type: "italic" }],
              text: "italic",
            },
            { type: "text", text: " text." },
          ],
        },
      ],
    },
    expected: "This is italic text.",
  },
  {
    name: "strikethrough text",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "This is " },
            {
              type: "text",
              marks: [{ type: "strike" }],
              text: "struck",
            },
            { type: "text", text: " text." },
          ],
        },
      ],
    },
    expected: "This is struck text.",
  },
  {
    name: "inline code",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Use the " },
            {
              type: "text",
              marks: [{ type: "code" }],
              text: "console.log()",
            },
            { type: "text", text: " function." },
          ],
        },
      ],
    },
    expected: "Use the console.log() function.",
  },
  {
    name: "mixed marks on the same text",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }, { type: "italic" }],
              text: "bold and italic",
            },
          ],
        },
      ],
    },
    expected: "bold and italic",
  },
  {
    name: "complex document with multiple block types",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Document Title" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "An introductory paragraph with " },
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "bold",
            },
            { type: "text", text: " text." },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Shopping List" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Milk" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Eggs" }],
                },
              ],
            },
          ],
        },
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "A wise quote." }],
            },
          ],
        },
        {
          type: "codeBlock",
          content: [{ type: "text", text: "console.log('hi');" }],
        },
      ],
    },
    expected:
      "Document Title An introductory paragraph with bold text. Shopping List Milk Eggs A wise quote. console.log('hi');",
  },
  {
    name: "empty paragraph",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    expected: "",
  },
  {
    name: "nested list items",
    input: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Parent item" }],
                },
                {
                  type: "bulletList",
                  content: [
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Child item" }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    expected: "Parent item Child item",
  },
];

it.each(testCases)("case: $name", ({ input, expected }) => {
  // Exercise
  const result = extractTextFromTiptap(input);

  // Verify
  expect(result).toEqual(expected);
});
