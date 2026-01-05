import { DataType, type Schema } from "@superego/schema";
import { describe, expect, it } from "vitest";
import RHFContent from "./RHFContent.js";

describe("fromRHFContent", () => {
  it("passes through primitive types unchanged", async () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            string: { dataType: DataType.String },
            number: { dataType: DataType.Number },
            boolean: { dataType: DataType.Boolean },
            stringLiteral: {
              dataType: DataType.StringLiteral,
              value: "stringLiteral",
            },
            numberLiteral: { dataType: DataType.NumberLiteral, value: 0 },
            booleanLiteral: { dataType: DataType.BooleanLiteral, value: true },
            enum: {
              dataType: DataType.Enum,
              members: {
                a: { value: "a" },
                b: { value: "b" },
                c: { value: "c" },
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const rhfContent = {
      string: "string",
      number: 0,
      boolean: true,
      stringLiteral: "stringLiteral",
      numberLiteral: 0,
      booleanLiteral: 0,
      enum: "b",
    };
    const result = await RHFContent.fromRHFContent(rhfContent, schema);

    // Verify
    expect(result).toEqual({
      string: "string",
      number: 0,
      boolean: true,
      stringLiteral: "stringLiteral",
      numberLiteral: 0,
      booleanLiteral: 0,
      enum: "b",
    });
  });

  it("handles null values in nullable properties", async () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: { dataType: DataType.String },
          },
          nullableProperties: ["value"],
        },
      },
      rootType: "Root",
    };
    const rhfContent = { value: null };
    const result = await RHFContent.fromRHFContent(rhfContent, schema);

    // Verify
    expect(result).toEqual({ value: null });
  });

  it("handles JsonObject type", async () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            jsonObject: { dataType: DataType.JsonObject },
          },
        },
      },
      rootType: "Root",
    };
    const rhfContent = {
      jsonObject: {
        __dataType: DataType.JsonObject,
        nested: { data: [1, 2, 3] },
      },
    };
    const result = await RHFContent.fromRHFContent(rhfContent, schema);

    // Verify
    expect(result).toEqual({
      jsonObject: {
        __dataType: DataType.JsonObject,
        nested: { data: [1, 2, 3] },
      },
    });
  });

  it("handles nested Struct types", async () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            outer: {
              dataType: DataType.Struct,
              properties: {
                inner: { dataType: DataType.String },
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const rhfContent = { outer: { inner: "value" } };
    const result = await RHFContent.fromRHFContent(rhfContent, schema);

    // Verify
    expect(result).toEqual({ outer: { inner: "value" } });
  });

  it("unwraps List items from { value } wrapper", async () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            items: {
              dataType: DataType.List,
              items: { dataType: DataType.String },
            },
          },
        },
      },
      rootType: "Root",
    };
    const rhfContent = {
      items: [{ value: "a" }, { value: "b" }, { value: "c" }],
    };
    const result = await RHFContent.fromRHFContent(rhfContent, schema);

    // Verify
    expect(result).toEqual({ items: ["a", "b", "c"] });
  });

  it("handles type references", async () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            string: { dataType: null, ref: "MyString" },
          },
        },
        MyString: { dataType: DataType.String },
      },
      rootType: "Root",
    };
    const rhfContent = { string: "string" };
    const result = await RHFContent.fromRHFContent(rhfContent, schema);

    // Verify
    expect(result).toEqual({ string: "string" });
  });

  describe("handles Files", () => {
    it("case: ProtoFiles", async () => {
      // Exercise
      const schema: Schema = {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              file: { dataType: DataType.File },
            },
          },
        },
        rootType: "Root",
      };
      const rhfContent = {
        file: new File(["content"], "file.txt", { type: "text/plain" }),
      };
      const result = await RHFContent.fromRHFContent(rhfContent, schema);

      // Verify
      expect(result.file.name).toEqual("file.txt");
      expect(result.file.content).toBeInstanceOf(Uint8Array);
    });

    it("case: FileRefs", async () => {
      // Exercise
      const schema: Schema = {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              file: { dataType: DataType.File },
            },
          },
        },
        rootType: "Root",
      };
      const rhfContent = {
        file: {
          id: "file-ref-id",
          name: "file.txt",
        },
      };
      const result = await RHFContent.fromRHFContent(rhfContent, schema);

      // Verify
      expect(result.file).toEqual({
        id: "file-ref-id",
        name: "file.txt",
      });
    });
  });

  describe("handles lists of Files", () => {
    it("case: ProtoFiles", async () => {
      // Exercise
      const schema: Schema = {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              files: {
                dataType: DataType.List,
                items: { dataType: DataType.File },
              },
            },
          },
        },
        rootType: "Root",
      };
      const rhfContent = {
        files: [
          {
            value: new File(["content"], "file.txt", { type: "text/plain" }),
          },
        ],
      };
      const result = await RHFContent.fromRHFContent(rhfContent, schema);

      // Verify
      expect(Array.isArray(result.files)).toEqual(true);
      expect(result.files).toHaveLength(1);
      expect(result.files[0].content).toBeInstanceOf(Uint8Array);
      expect(result.files[0].content).not.toBeInstanceOf(Blob);
    });

    it("case: FileRefs", async () => {
      // Exercise
      const schema: Schema = {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              files: {
                dataType: DataType.List,
                items: { dataType: DataType.File },
              },
            },
          },
        },
        rootType: "Root",
      };
      const rhfContent = {
        files: [
          {
            value: {
              id: "file-ref-id",
              name: "file.txt",
            },
          },
        ],
      };
      const result = await RHFContent.fromRHFContent(rhfContent, schema);

      // Verify
      expect(Array.isArray(result.files)).toEqual(true);
      expect(result.files).toHaveLength(1);
      expect(result.files[0]).toEqual({
        id: "file-ref-id",
        name: "file.txt",
      });
    });
  });
});

describe("toRHFContent", () => {
  it("passes through primitive types unchanged", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            string: { dataType: DataType.String },
            number: { dataType: DataType.Number },
            boolean: { dataType: DataType.Boolean },
            stringLiteral: {
              dataType: DataType.StringLiteral,
              value: "stringLiteral",
            },
            numberLiteral: { dataType: DataType.NumberLiteral, value: 0 },
            booleanLiteral: { dataType: DataType.BooleanLiteral, value: true },
            enum: {
              dataType: DataType.Enum,
              members: {
                a: { value: "a" },
                b: { value: "b" },
                c: { value: "c" },
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      string: "string",
      number: 0,
      boolean: true,
      stringLiteral: "stringLiteral",
      numberLiteral: 0,
      booleanLiteral: 0,
      enum: "b",
    };
    const result = RHFContent.toRHFContent(content, schema);

    // Verify
    expect(result).toEqual({
      string: "string",
      number: 0,
      boolean: true,
      stringLiteral: "stringLiteral",
      numberLiteral: 0,
      booleanLiteral: 0,
      enum: "b",
    });
  });

  it("handles null values in nullable properties", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: { dataType: DataType.String },
          },
          nullableProperties: ["value"],
        },
      },
      rootType: "Root",
    };
    const content = { value: null };
    const result = RHFContent.toRHFContent(content, schema);

    // Verify
    expect(result).toEqual({ value: null });
  });

  it("handles JsonObject type", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            jsonObject: { dataType: DataType.JsonObject },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      jsonObject: {
        __dataType: DataType.JsonObject,
        nested: { data: [1, 2, 3] },
      },
    };
    const result = RHFContent.toRHFContent(content, schema);

    // Verify
    expect(result).toEqual({
      jsonObject: {
        __dataType: DataType.JsonObject,
        nested: { data: [1, 2, 3] },
      },
    });
  });

  it("handles nested Struct types", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            outer: {
              dataType: DataType.Struct,
              properties: {
                inner: { dataType: DataType.String },
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const content = { outer: { inner: "value" } };
    const result = RHFContent.toRHFContent(content, schema);

    // Verify
    expect(result).toEqual({ outer: { inner: "value" } });
  });

  it("wraps List items in { value } wrapper", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            items: {
              dataType: DataType.List,
              items: { dataType: DataType.String },
            },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      items: ["a", "b", "c"],
    };
    const result = RHFContent.toRHFContent(content, schema);

    // Verify
    expect(result).toEqual({
      items: [{ value: "a" }, { value: "b" }, { value: "c" }],
    });
  });

  it("handles type references", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            string: { dataType: null, ref: "MyString" },
          },
        },
        MyString: { dataType: DataType.String },
      },
      rootType: "Root",
    };
    const content = { string: "string" };
    const result = RHFContent.toRHFContent(content, schema);

    // Verify
    expect(result).toEqual({ string: "string" });
  });

  describe("handles Files", () => {
    it("case: ProtoFiles", () => {
      // Exercise
      const schema: Schema = {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              file: { dataType: DataType.File },
            },
          },
        },
        rootType: "Root",
      };
      const content = {
        file: {
          name: "file.txt",
          mimeType: "text/plain",
          content: new Uint8Array([99, 111, 110, 116, 101, 110, 116]),
        },
      };
      const result = RHFContent.toRHFContent(content, schema);

      // Verify
      expect(result.file).toBeInstanceOf(File);
      expect(result.file.name).toEqual("file.txt");
      expect(result.file.type).toEqual("text/plain");
    });

    it("case: FileRefs", () => {
      // Exercise
      const schema: Schema = {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              file: { dataType: DataType.File },
            },
          },
        },
        rootType: "Root",
      };
      const content = {
        file: {
          id: "file-ref-id",
          name: "file.txt",
        },
      };
      const result = RHFContent.toRHFContent(content, schema);

      // Verify
      expect(result.file).toEqual({
        id: "file-ref-id",
        name: "file.txt",
      });
    });
  });

  describe("handles lists of Files", () => {
    it("case: ProtoFiles", () => {
      // Exercise
      const schema: Schema = {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              files: {
                dataType: DataType.List,
                items: { dataType: DataType.File },
              },
            },
          },
        },
        rootType: "Root",
      };
      const content = {
        files: [
          {
            name: "file.txt",
            mimeType: "text/plain",
            content: new Uint8Array([99, 111, 110, 116, 101, 110, 116]),
          },
        ],
      };
      const result = RHFContent.toRHFContent(content, schema);

      // Verify
      expect(Array.isArray(result.files)).toEqual(true);
      expect(result.files).toHaveLength(1);
      expect(result.files[0].value).toBeInstanceOf(File);
      expect(result.files[0].value).not.toBeInstanceOf(Uint8Array);
    });

    it("case: FileRefs", () => {
      // Exercise
      const schema: Schema = {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              files: {
                dataType: DataType.List,
                items: { dataType: DataType.File },
              },
            },
          },
        },
        rootType: "Root",
      };
      const content = {
        files: [
          {
            id: "file-ref-id",
            name: "file.txt",
          },
        ],
      };
      const result = RHFContent.toRHFContent(content, schema);

      // Verify
      expect(Array.isArray(result.files)).toEqual(true);
      expect(result.files).toHaveLength(1);
      expect(result.files[0].value).toEqual({
        id: "file-ref-id",
        name: "file.txt",
      });
    });
  });
});
