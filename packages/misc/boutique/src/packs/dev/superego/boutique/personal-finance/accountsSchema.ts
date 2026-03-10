import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    Account: {
      description: "A brokerage or exchange account",
      dataType: DataType.Struct,
      properties: {
        name: {
          description: "Account name",
          dataType: DataType.String,
        },
        broker: {
          description: "Broker or exchange name",
          dataType: DataType.String,
        },
        currency: {
          description: "Primary currency of the account",
          dataType: DataType.String,
        },
        notes: {
          description: "Optional notes about this account",
          dataType: DataType.String,
          format: "dev.superego:String.Markdown",
        },
      },
      nullableProperties: ["notes"],
    },
  },
  rootType: "Account",
} as const satisfies Schema;
