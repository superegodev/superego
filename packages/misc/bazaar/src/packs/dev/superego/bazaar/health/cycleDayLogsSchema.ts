import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    Flow: {
      description: "Logged flow intensity for a given day.",
      dataType: DataType.Enum,
      members: {
        None: {
          value: "None",
        },
        Light: {
          value: "Light",
        },
        Medium: {
          value: "Medium",
        },
        Heavy: {
          value: "Heavy",
        },
      },
    },
    CycleDayLog: {
      description: "A single day log in a menstrual cycle.",
      dataType: DataType.Struct,
      properties: {
        date: {
          description: "Day represented by this log.",
          dataType: DataType.String,
          format: "dev.superego:String.PlainDate",
        },
        flow: {
          description: "Flow intensity for the day.",
          dataType: null,
          ref: "Flow",
        },
        symptoms: {
          description: "Symptoms logged for this day.",
          dataType: DataType.List,
          items: {
            dataType: DataType.String,
          },
        },
        notes: {
          description: "Additional notes for the day.",
          dataType: DataType.JsonObject,
          format: "dev.superego:JsonObject.TiptapRichText",
        },
      },
      nullableProperties: ["flow", "symptoms", "notes"],
    },
  },
  rootType: "CycleDayLog",
} as const satisfies Schema;
