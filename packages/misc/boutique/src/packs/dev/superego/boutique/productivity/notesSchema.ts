import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    Note: {
      dataType: DataType.Struct,
      properties: {
        title: { dataType: DataType.String },
        date: {
          dataType: DataType.String,
          format: "dev.superego:String.PlainDate",
        },
        tags: {
          dataType: DataType.List,
          items: { dataType: DataType.String },
        },
        note: {
          dataType: DataType.String,
          format: "dev.superego:String.Markdown",
        },
      },
      nullableProperties: ["date"],
    },
  },
  rootType: "Note",
} as const satisfies Schema;
