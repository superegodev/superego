import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { describe, it } from "vitest";
import DataType from "./DataType.js";
import type Schema from "./Schema.js";
import type TypeOf from "./TypeOf.js";
import type FileRef from "./types/FileRef.js";
import type JsonObject from "./types/JsonObject.js";
import type ProtoFile from "./types/ProtoFile.js";

describe("TypeOf", () => {
  it("non-nullable String", () => {
    const schema = {
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
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      string: string;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("nullable String", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            string: {
              dataType: DataType.String,
            },
          },
          nullableProperties: ["string"],
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      string: string | null;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("non-nullable Enum", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            enum: {
              dataType: DataType.Enum,
              members: {
                A: { value: "A" },
                B: { value: "B" },
              },
            },
          },
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      enum: "A" | "B";
    };
    assert<Equals<Actual, Expected>>();
  });

  it("nullable Enum", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            enum: {
              dataType: DataType.Enum,
              members: {
                A: { value: "A" },
                B: { value: "B" },
              },
            },
          },
          nullableProperties: ["enum"],
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      enum: "A" | "B" | null;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("non-nullable Number", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            number: {
              dataType: DataType.Number,
            },
          },
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      number: number;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("nullable Number", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            number: {
              dataType: DataType.Number,
            },
          },
          nullableProperties: ["number"],
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      number: number | null;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("non-nullable Boolean", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            boolean: {
              dataType: DataType.Boolean,
            },
          },
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      boolean: boolean;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("nullable Boolean", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            boolean: {
              dataType: DataType.Boolean,
            },
          },
          nullableProperties: ["boolean"],
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      boolean: boolean | null;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("non-nullable StringLiteral", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            string: {
              dataType: DataType.StringLiteral,
              value: "string",
            },
          },
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      string: "string";
    };
    assert<Equals<Actual, Expected>>();
  });

  it("nullable StringLiteral", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            string: {
              dataType: DataType.StringLiteral,
              value: "string",
            },
          },
          nullableProperties: ["string"],
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      string: "string" | null;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("non-nullable NumberLiteral", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            number: {
              dataType: DataType.NumberLiteral,
              value: 42,
            },
          },
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      number: 42;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("nullable NumberLiteral", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            number: {
              dataType: DataType.NumberLiteral,
              value: 42,
            },
          },
          nullableProperties: ["number"],
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      number: 42 | null;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("non-nullable BooleanLiteral", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            boolean: {
              dataType: DataType.BooleanLiteral,
              value: true,
            },
          },
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      boolean: true;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("nullable BooleanLiteral", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            boolean: {
              dataType: DataType.BooleanLiteral,
              value: true,
            },
          },
          nullableProperties: ["boolean"],
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      boolean: true | null;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("non-nullable JsonObject", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            jsonObject: {
              dataType: DataType.JsonObject,
            },
          },
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      jsonObject: JsonObject;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("nullable JsonObject", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            jsonObject: {
              dataType: DataType.JsonObject,
            },
          },
          nullableProperties: ["jsonObject"],
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      jsonObject: JsonObject | null;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("non-nullable File", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            file: {
              dataType: DataType.File,
            },
          },
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      file: ProtoFile | FileRef;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("nullable File", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            file: {
              dataType: DataType.File,
            },
          },
          nullableProperties: ["file"],
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      file: ProtoFile | FileRef | null;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("non-nullable List", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            list: {
              dataType: DataType.List,
              items: {
                dataType: DataType.String,
              },
            },
          },
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      list: string[];
    };
    assert<Equals<Actual, Expected>>();
  });

  it("nullable List", () => {
    const schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            list: {
              dataType: DataType.List,
              items: {
                dataType: DataType.String,
              },
            },
          },
          nullableProperties: ["list"],
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      list: string[] | null;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("non-nullable ref", () => {
    const schema = {
      types: {
        Enum: {
          dataType: DataType.Enum,
          members: {
            A: { value: "A" },
            B: { value: "B" },
          },
        },
        Root: {
          dataType: DataType.Struct,
          properties: {
            enum: {
              dataType: null,
              ref: "Enum",
            },
          },
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      enum: "A" | "B";
    };
    assert<Equals<Actual, Expected>>();
  });

  it("nullable ref", () => {
    const schema = {
      types: {
        Enum: {
          dataType: DataType.Enum,
          members: {
            A: { value: "A" },
            B: { value: "B" },
          },
        },
        Root: {
          dataType: DataType.Struct,
          properties: {
            enum: {
              dataType: null,
              ref: "Enum",
            },
          },
          nullableProperties: ["enum"],
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      enum: ("A" | "B") | null;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("non-nullable Struct", () => {
    const schema = {
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
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      nested: { string: string };
    };
    assert<Equals<Actual, Expected>>();
  });

  it("nullable Struct", () => {
    const schema = {
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
          nullableProperties: ["nested"],
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      nested: { string: string } | null;
    };
    assert<Equals<Actual, Expected>>();
  });

  it("case: kitchen sink", () => {
    const schema = {
      types: {
        Enum: {
          dataType: DataType.Enum,
          members: { A: { value: "A" }, B: { value: "B" } },
        },
        ReferencedStruct: {
          dataType: DataType.Struct,
          properties: { nonNullableString: { dataType: DataType.String } },
        },
        Root: {
          dataType: DataType.Struct,
          properties: {
            nonNullableString: { dataType: DataType.String },
            nonNullableEnum: {
              dataType: DataType.Enum,
              members: { A: { value: "A" }, B: { value: "B" } },
            },
            nonNullableNumber: { dataType: DataType.Number },
            nonNullableBoolean: { dataType: DataType.Boolean },
            nonNullableStringLiteral: {
              dataType: DataType.StringLiteral,
              value: "literal",
            },
            nonNullableNumberLiteral: {
              dataType: DataType.NumberLiteral,
              value: 42,
            },
            nonNullableBooleanLiteral: {
              dataType: DataType.BooleanLiteral,
              value: true,
            },
            nonNullableJsonObject: { dataType: DataType.JsonObject },
            nonNullableFile: { dataType: DataType.File },
            nonNullableStruct: {
              dataType: DataType.Struct,
              properties: { nonNullableString: { dataType: DataType.String } },
            },
            nonNullableStringList: {
              dataType: DataType.List,
              items: { dataType: DataType.String },
            },
            nonNullableStructList: {
              dataType: DataType.List,
              items: {
                dataType: DataType.Struct,
                properties: {
                  nonNullableString: { dataType: DataType.String },
                },
              },
            },
            nonNullableRefEnum: { dataType: null, ref: "Enum" },
            nonNullableRefStruct: { dataType: null, ref: "ReferencedStruct" },
            nullableString: { dataType: DataType.String },
            nullableEnum: {
              dataType: DataType.Enum,
              members: { A: { value: "A" }, B: { value: "B" } },
            },
            nullableNumber: { dataType: DataType.Number },
            nullableBoolean: { dataType: DataType.Boolean },
            nullableStringLiteral: {
              dataType: DataType.StringLiteral,
              value: "literal",
            },
            nullableNumberLiteral: {
              dataType: DataType.NumberLiteral,
              value: 42,
            },
            nullableBooleanLiteral: {
              dataType: DataType.BooleanLiteral,
              value: true,
            },
            nullableJsonObject: { dataType: DataType.JsonObject },
            nullableFile: { dataType: DataType.File },
            nullableStruct: {
              dataType: DataType.Struct,
              properties: { nonNullableString: { dataType: DataType.String } },
            },
            nullableStringList: {
              dataType: DataType.List,
              items: { dataType: DataType.String },
            },
            nullableStructList: {
              dataType: DataType.List,
              items: {
                dataType: DataType.Struct,
                properties: {
                  nonNullableString: { dataType: DataType.String },
                },
              },
            },
            nullableRefEnum: { dataType: null, ref: "Enum" },
            nullableRefStruct: { dataType: null, ref: "ReferencedStruct" },
            deepNesting: {
              dataType: DataType.Struct,
              properties: {
                l0: {
                  dataType: DataType.Struct,
                  properties: {
                    l1: {
                      dataType: DataType.List,
                      items: {
                        dataType: DataType.Struct,
                        properties: {
                          l2: {
                            dataType: DataType.Struct,
                            properties: {
                              nonNullableString: { dataType: DataType.String },
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
          nullableProperties: [
            "nullableString",
            "nullableEnum",
            "nullableNumber",
            "nullableBoolean",
            "nullableStringLiteral",
            "nullableNumberLiteral",
            "nullableBooleanLiteral",
            "nullableJsonObject",
            "nullableFile",
            "nullableStruct",
            "nullableStringList",
            "nullableStructList",
            "nullableRefEnum",
            "nullableRefStruct",
          ],
        },
      },
      rootType: "Root",
    } as const satisfies Schema;

    type Actual = TypeOf<typeof schema>;
    type Expected = {
      nonNullableString: string;
      nonNullableEnum: "A" | "B";
      nonNullableNumber: number;
      nonNullableBoolean: boolean;
      nonNullableStringLiteral: "literal";
      nonNullableNumberLiteral: 42;
      nonNullableBooleanLiteral: true;
      nonNullableJsonObject: JsonObject;
      nonNullableFile: ProtoFile | FileRef;
      nonNullableStruct: { nonNullableString: string };
      nonNullableStringList: string[];
      nonNullableStructList: { nonNullableString: string }[];
      nonNullableRefEnum: "A" | "B";
      nonNullableRefStruct: { nonNullableString: string };
      nullableString: string | null;
      nullableEnum: ("A" | "B") | null;
      nullableNumber: number | null;
      nullableBoolean: boolean | null;
      nullableStringLiteral: "literal" | null;
      nullableNumberLiteral: 42 | null;
      nullableBooleanLiteral: true | null;
      nullableJsonObject: JsonObject | null;
      nullableFile: ProtoFile | FileRef | null;
      nullableStruct: { nonNullableString: string } | null;
      nullableStringList: string[] | null;
      nullableStructList: { nonNullableString: string }[] | null;
      nullableRefEnum: ("A" | "B") | null;
      nullableRefStruct: { nonNullableString: string } | null;
      deepNesting: {
        l0: {
          l1: {
            l2: { nonNullableString: string };
          }[];
        };
      };
    };
    assert<Equals<Actual, Expected>>();
  });
});
