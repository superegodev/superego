import DataType from "../DataType.js";
import FormatId from "../formats/FormatId.js";
import type Schema from "../Schema.js";

export default {
  types: {
    Feeling: {
      description: "User's subjective feeling at the time of weigh-in.",
      dataType: DataType.Enum,
      members: {
        Great: { value: "GREAT" },
        Good: { value: "GOOD" },
        Neutral: { value: "NEUTRAL" },
        Bad: { value: "BAD" },
        Terrible: { value: "TERRIBLE" },
      },
    },
    WeighIn: {
      description: "Represents a single weigh-in event for the user.",
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
          dataType: DataType.StringLiteral,
          value: "SmartScale V3 Pro",
        },
        feeling: { dataType: null, ref: "Feeling" },
        progressPhoto: {
          description: "Optional photo taken at the time of weigh-in.",
          dataType: DataType.File,
        },
        notes: { dataType: DataType.String },
      },
      nullableProperties: [
        "bodyFatPercentage",
        "muscleMassKg",
        "progressPhoto",
        "notes",
        "feeling",
      ],
    },
  },
  rootType: "WeighIn",
} satisfies Schema;
