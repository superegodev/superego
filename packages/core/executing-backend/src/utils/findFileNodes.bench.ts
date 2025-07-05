import { DataType, type Schema } from "@superego/schema";
import { bench } from "vitest";
import findFileNodes from "./findFileNodes.js";

bench("complex schema", () => {
  const schema: Schema = {
    types: {
      Enum: {
        dataType: DataType.Enum,
        members: {
          A: { value: "A" },
          B: { value: "B" },
          C: { value: "C" },
        },
      },
      Root: {
        dataType: DataType.Struct,
        properties: {
          nonNullableString: {
            dataType: DataType.String,
          },
          nullableString: {
            dataType: DataType.String,
          },
          nonNullableEnum: {
            dataType: null,
            ref: "Enum",
          },
          nullableEnum: {
            dataType: null,
            ref: "Enum",
          },
          nonNullableNumber: {
            dataType: DataType.Number,
          },
          nullableNumber: {
            dataType: DataType.Number,
          },
          nonNullableBoolean: {
            dataType: DataType.Boolean,
          },
          nullableBoolean: {
            dataType: DataType.Boolean,
          },
          nonNullableJsonObject: {
            dataType: DataType.JsonObject,
          },
          nullableJsonObject: {
            dataType: DataType.JsonObject,
          },
          nonNullableFile: {
            dataType: DataType.File,
          },
          nullableFile: {
            dataType: DataType.File,
          },
          nonNullableStruct: {
            dataType: DataType.Struct,
            properties: {
              nonNullableString: {
                dataType: DataType.String,
              },
            },
          },
          nullableStruct: {
            dataType: DataType.Struct,
            properties: {
              nonNullableString: {
                dataType: DataType.String,
              },
            },
          },
          nonNullableStringList: {
            dataType: DataType.List,
            items: {
              dataType: DataType.String,
            },
          },
          nullableStringList: {
            dataType: DataType.List,
            items: {
              dataType: DataType.String,
            },
          },
          nonNullableStructList: {
            dataType: DataType.List,
            items: {
              dataType: DataType.Struct,
              properties: {
                nonNullableString: {
                  dataType: DataType.String,
                },
              },
            },
          },
          nullableStructList: {
            dataType: DataType.List,
            items: {
              dataType: DataType.Struct,
              properties: {
                nonNullableString: {
                  dataType: DataType.String,
                },
              },
            },
          },
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
                            nonNullableString: {
                              dataType: DataType.String,
                            },
                            nonNullableFile: {
                              dataType: DataType.File,
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
        },
        nullableProperties: [
          "nullableString",
          "nullableEnum",
          "nullableNumber",
          "nullableBoolean",
          "nullableJsonObject",
          "nullableFile",
          "nullableStruct",
          "nullableStringList",
          "nullableStructList",
        ],
      },
    },
    rootType: "Root",
  };
  const value = {
    nonNullableString: "nonNullableString",
    nullableString: null,
    nonNullableEnum: "A",
    nullableEnum: null,
    nonNullableNumber: 0,
    nullableNumber: null,
    nonNullableBoolean: false,
    nullableBoolean: null,
    nonNullableJsonObject: { __dataType: DataType.JsonObject },
    nullableJsonObject: null,
    nonNullableFile: {
      id: "file_0",
      name: "name",
      mimeType: "mimeType",
    },
    nullableFile: null,
    nonNullableStruct: {
      nonNullableString: "nonNullableString",
    },
    nullableStruct: null,
    nonNullableStringList: [],
    nullableStringList: null,
    nonNullableStructList: [],
    nullableStructList: null,
    deepNesting: {
      l0: {
        l1: [
          {
            l2: {
              nonNullableString: "nonNullableString",
              nonNullableFile: {
                id: "file_0",
                name: "name",
                mimeType: "mimeType",
              },
            },
          },
        ],
      },
    },
  };
  findFileNodes(schema, value);
});
