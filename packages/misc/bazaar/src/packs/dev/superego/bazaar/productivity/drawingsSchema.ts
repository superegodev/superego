import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    Drawing: {
      dataType: DataType.Struct,
      properties: {
        title: {
          dataType: DataType.String,
        },
        drawing: {
          dataType: DataType.JsonObject,
          format: "dev.superego:JsonObject.ExcalidrawDrawing",
        },
      },
    },
  },
  rootType: "Drawing",
} as const satisfies Schema;
