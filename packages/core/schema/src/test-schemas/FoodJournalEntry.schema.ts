import DataType from "../DataType.js";
import FormatId from "../formats/FormatId.js";
import type Schema from "../Schema.js";

export default {
  types: {
    MassQuantity: {
      description: { en: "A quantity of mass." },
      dataType: DataType.Struct,
      properties: {
        unit: {
          description: { en: "Grams." },
          dataType: DataType.StringLiteral,
          value: "g",
        },
        amount: { dataType: DataType.Number },
      },
    },
    FoodJournalEntry: {
      dataType: DataType.Struct,
      properties: {
        date: {
          dataType: DataType.String,
          format: FormatId.String.PlainDate,
        },
        meals: {
          dataType: DataType.List,
          items: {
            dataType: DataType.Struct,
            properties: {
              time: {
                dataType: DataType.String,
                format: FormatId.String.Instant,
              },
              consumedFoods: {
                dataType: DataType.List,
                items: {
                  dataType: DataType.Struct,
                  properties: {
                    foodId: { dataType: DataType.String },
                    quantity: { dataType: null, ref: "MassQuantity" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  rootType: "FoodJournalEntry",
} satisfies Schema;
