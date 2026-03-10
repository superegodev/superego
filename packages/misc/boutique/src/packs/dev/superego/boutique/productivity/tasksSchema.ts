import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    Stage: {
      dataType: DataType.Enum,
      members: {
        Backlog: { value: "Backlog" },
        Scheduled: { value: "Scheduled" },
        Doing: { value: "Doing" },
        Done: { value: "Done" },
      },
      membersOrder: ["Backlog", "Scheduled", "Doing", "Done"],
    },
    Task: {
      dataType: DataType.Struct,
      properties: {
        title: { dataType: DataType.String },
        description: {
          dataType: DataType.String,
          format: "dev.superego:String.Markdown",
        },
        stage: { dataType: null, ref: "Stage" },
        dueDate: {
          dataType: DataType.String,
          format: "dev.superego:String.PlainDate",
        },
        priority: {
          dataType: DataType.Number,
        },
        archived: { dataType: DataType.Boolean },
      },
      nullableProperties: ["description", "dueDate"],
    },
  },
  rootType: "Task",
} as const satisfies Schema;
