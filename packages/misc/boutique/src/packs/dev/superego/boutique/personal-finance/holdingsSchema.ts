import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    TransactionType: {
      dataType: DataType.Enum,
      members: {
        Buy: { value: "Buy" },
        Sell: { value: "Sell" },
      },
      membersOrder: ["Buy", "Sell"],
    },
    Transaction: {
      description: "A buy or sell transaction",
      dataType: DataType.Struct,
      properties: {
        type: {
          description: "Transaction type",
          dataType: null,
          ref: "TransactionType",
        },
        date: {
          description: "Date of the transaction",
          dataType: DataType.String,
          format: "dev.superego:String.PlainDate",
        },
        quantity: {
          description: "Number of units",
          dataType: DataType.Number,
        },
        pricePerUnit: {
          description: "Price per unit at time of transaction",
          dataType: DataType.Number,
        },
        fees: {
          description: "Transaction fees",
          dataType: DataType.Number,
        },
      },
      nullableProperties: ["fees"],
    },
    Holding: {
      description: "A security holding with its transaction history",
      dataType: DataType.Struct,
      properties: {
        security: {
          description: "Reference to the security in the catalogue",
          dataType: DataType.DocumentRef,
          collectionId: "ProtoCollection_1",
        },
        account: {
          description: "Reference to the brokerage account",
          dataType: DataType.DocumentRef,
          collectionId: "ProtoCollection_3",
        },
        notes: {
          description: "Optional notes about this holding",
          dataType: DataType.String,
          format: "dev.superego:String.Markdown",
        },
        transactions: {
          description: "List of buy and sell transactions",
          dataType: DataType.List,
          items: { dataType: null, ref: "Transaction" },
        },
      },
      nullableProperties: ["notes"],
    },
  },
  rootType: "Holding",
} as const satisfies Schema;
