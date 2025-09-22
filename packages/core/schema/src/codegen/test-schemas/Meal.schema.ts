import DataType from "../../DataType.js";
import FormatId from "../../formats/FormatId.js";
import type Schema from "../../Schema.js";

export default {
  types: {
    Type: {
      dataType: DataType.Enum,
      members: {
        Breakfast: { value: "Breakfast" },
        MorningSnack: { value: "MorningSnack" },
        Lunch: { value: "Lunch" },
        AfternoonSnack: { value: "AfternoonSnack" },
        Dinner: { value: "Dinner" },
        EveningSnack: { value: "EveningSnack" },
      },
    },
    MassQuantity: {
      description: "A quantity of mass.",
      dataType: DataType.Struct,
      properties: {
        unit: {
          description: "Grams.",
          dataType: DataType.StringLiteral,
          value: "g",
        },
        amount: { dataType: DataType.Number },
      },
    },
    Meal: {
      dataType: DataType.Struct,
      properties: {
        type: { dataType: null, ref: "Type" },
        date: {
          description: "The date of the meal.",
          dataType: DataType.String,
          format: FormatId.String.PlainDate,
        },
        consumedFoods: {
          description: "Foods consumed during the meal.",
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
  rootType: "Meal",
} satisfies Schema;
