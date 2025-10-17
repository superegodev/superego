import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    Settings: {
      dataType: DataType.Struct,
      properties: {
        calendarId: {
          dataType: DataType.String,
        },
      },
    },
  },
  rootType: "Settings",
} as const satisfies Schema;
