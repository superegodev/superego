import { DataType, type Schema } from "@superego/schema";

const calendarSchema: Schema = {
  types: {
    Type: {
      description: "Type of a calendar entry.",
      dataType: DataType.Enum,
      members: {
        Event: {
          description:
            "An event, with a defined start time and a defined end time",
          value: "Event",
        },
        Reminder: {
          description: "A reminder, with a defined start time but no end time",
          value: "Reminder",
        },
      },
    },
    CalendarEntry: {
      description: "An entry in my calendar.",
      dataType: DataType.Struct,
      properties: {
        type: {
          description: "The type of the entry.",
          dataType: null,
          ref: "Type",
        },
        title: {
          description: "Short title for the entry. 5 words max.",
          dataType: DataType.String,
        },
        startTime: {
          description: "When the event or reminder starts.",
          dataType: DataType.String,
          format: "dev.superego:String.Instant",
        },
        endTime: {
          description: "When the event or reminder ends. Null for reminders.",
          dataType: DataType.String,
          format: "dev.superego:String.Instant",
        },
        notes: {
          description: "Misc notes.",
          dataType: DataType.JsonObject,
          format: "dev.superego:JsonObject.TiptapRichText",
        },
      },
      nullableProperties: ["endTime", "notes"],
    },
  },
  rootType: "CalendarEntry",
};
export default calendarSchema;
