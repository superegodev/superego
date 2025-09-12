import DataType from "../../DataType.js";
import FormatId from "../../formats/FormatId.js";
import type Schema from "../../Schema.js";

export default {
  types: {
    WeighIn: {
      description: " A single weigh-in.",
      dataType: DataType.Struct,
      properties: {
        timestamp: {
          description: "When the weigh-in occurred.",
          dataType: DataType.String,
          format: FormatId.String.Instant,
        },
        weightKg: {
          description: "Weight in kilograms.",
          dataType: DataType.Number,
        },
        bodyFatPercentage: {
          description: "Body fat percentage.",
          dataType: DataType.Number,
        },
        muscleMassKg: {
          description: "Muscle mass in kilograms.",
          dataType: DataType.Number,
        },
        measurementDevice: {
          description: "Device used for measurement.",
          dataType: DataType.String,
        },
        notes: { dataType: DataType.String },
      },
      nullableProperties: ["bodyFatPercentage", "muscleMassKg", "notes"],
    },
  },
  rootType: "WeighIn",
} satisfies Schema;
