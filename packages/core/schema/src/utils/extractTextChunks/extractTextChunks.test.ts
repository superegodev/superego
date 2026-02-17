import { describe, expect, it } from "vitest";
import DataType from "../../DataType.js";
import FormatId from "../../formats/FormatId.js";
import type Schema from "../../Schema.js";
import extractTextChunks from "./extractTextChunks.js";

describe("extracts text chunks for the supplied document content", () => {
  it("case: top-level String property", () => {
    // Exercise
    const content = {
      string: "string",
    };
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            string: {
              dataType: DataType.String,
            },
          },
        },
      },
      rootType: "Root",
    };
    const textChunks = extractTextChunks(schema, content);

    // Verify
    expect(textChunks).toEqual({
      string: ["string"],
    });
  });

  it("case: nested String property", () => {
    // Exercise
    const content = {
      nested: {
        string: "string",
      },
    };
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nested: {
              dataType: DataType.Struct,
              properties: {
                string: {
                  dataType: DataType.String,
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const textChunks = extractTextChunks(schema, content);

    // Verify
    expect(textChunks).toEqual({
      "nested.string": ["string"],
    });
  });

  it("case: List of Strings", () => {
    // Exercise
    const content = {
      listOfStrings: ["string0", "string1"],
    };
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            listOfStrings: {
              dataType: DataType.List,
              items: {
                dataType: DataType.String,
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const textChunks = extractTextChunks(schema, content);

    // Verify
    expect(textChunks).toEqual({
      "listOfStrings.$": ["string0", "string1"],
    });
  });

  it("case: empty List of Strings", () => {
    // Exercise
    const content = { listOfStrings: [] };
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            listOfStrings: {
              dataType: DataType.List,
              items: {
                dataType: DataType.String,
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const textChunks = extractTextChunks(schema, content);

    // Verify
    expect(textChunks).toEqual({});
  });

  it("case: List of Structs with a String property", () => {
    // Exercise
    const content = {
      listOfStructs: [{ string: "string0" }, { string: "string1" }],
    };
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            listOfStructs: {
              dataType: DataType.List,
              items: {
                dataType: DataType.Struct,
                properties: {
                  string: {
                    dataType: DataType.String,
                  },
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const textChunks = extractTextChunks(schema, content);

    // Verify
    expect(textChunks).toEqual({
      "listOfStructs.$.string": ["string0", "string1"],
    });
  });

  it("case: complex nested Lists", () => {
    // Exercise
    const content = {
      list: [
        { nestedList: [{ string: "string00" }, { string: "string01" }] },
        { nestedList: [{ string: "string10" }, { string: "string11" }] },
      ],
    };
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            list: {
              dataType: DataType.List,
              items: {
                dataType: DataType.Struct,
                properties: {
                  nestedList: {
                    dataType: DataType.List,
                    items: {
                      dataType: DataType.Struct,
                      properties: {
                        string: {
                          dataType: DataType.String,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const textChunks = extractTextChunks(schema, content);

    // Verify
    expect(textChunks).toEqual({
      "list.$.nestedList.$.string": [
        "string00",
        "string01",
        "string10",
        "string11",
      ],
    });
  });

  it("case: TiptapRichText JsonObject", () => {
    // Exercise
    const content = {
      tiptap: {
        __dataType: DataType.JsonObject,
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: { textAlign: null },
            content: [{ type: "text", text: "paragraph" }],
          },
        ],
      },
    };
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            tiptap: {
              dataType: DataType.JsonObject,
              format: FormatId.JsonObject.TiptapRichText,
            },
          },
        },
      },
      rootType: "Root",
    };
    const textChunks = extractTextChunks(schema, content);

    // Verify
    expect(textChunks).toEqual({
      tiptap: ["paragraph"],
    });
  });

  it("case: Markdown String", () => {
    // Exercise
    const content = {
      markdown: "**bold** and _italic_",
    };
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            markdown: {
              dataType: DataType.String,
              format: FormatId.String.Markdown,
            },
          },
        },
      },
      rootType: "Root",
    };
    const textChunks = extractTextChunks(schema, content);

    // Verify
    expect(textChunks).toEqual({
      markdown: ["bold and italic"],
    });
  });

  it("case: ExcalidrawDrawing JsonObject", () => {
    // Exercise
    const content = {
      excalidraw: {
        __dataType: DataType.JsonObject,
        elements: [
          { type: "text", text: "hello" },
          { type: "rectangle", x: 0, y: 0 },
          { type: "text", text: "world" },
        ],
      },
    };
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            excalidraw: {
              dataType: DataType.JsonObject,
              format: FormatId.JsonObject.ExcalidrawDrawing,
            },
          },
        },
      },
      rootType: "Root",
    };
    const textChunks = extractTextChunks(schema, content);

    // Verify
    expect(textChunks).toEqual({
      excalidraw: ["hello world"],
    });
  });
});

describe("ignores non-text properties", () => {
  it("case: PlainDate property", () => {
    // Exercise
    const content = {
      plainDate: "2025-12-26",
    };
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            plainDate: {
              dataType: DataType.String,
              format: FormatId.String.PlainDate,
            },
          },
        },
      },
      rootType: "Root",
    };
    const textChunks = extractTextChunks(schema, content);

    // Verify
    expect(textChunks).toEqual({});
  });
});
