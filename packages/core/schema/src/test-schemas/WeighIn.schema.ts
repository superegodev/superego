import DataType from "../DataType.js";
import FormatId from "../formats/FormatId.js";
import type Schema from "../Schema.js";

export default {
  types: {
    Feeling: {
      description: { en: "User's subjective feeling at the time of weigh-in." },
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
      description: { en: "Represents a single weigh-in event for the user." },
      dataType: DataType.Struct,
      properties: {
        timestamp: {
          description: { en: "When the weigh-in occurred." },
          dataType: DataType.String,
          format: FormatId.String.Instant,
        },
        weightKg: {
          description: { en: "Weight in kilograms." },
          dataType: DataType.Number,
        },
        bodyFatPercentage: {
          description: { en: "Body fat percentage." },
          dataType: DataType.Number,
        },
        muscleMassKg: {
          description: { en: "Muscle mass in kilograms." },
          dataType: DataType.Number,
        },
        measurementDevice: {
          description: { en: "Device used for measurement." },
          dataType: DataType.StringLiteral,
          value: "SmartScale V3 Pro",
        },
        feeling: { dataType: null, ref: "Feeling" },
        progressPhoto: {
          description: { en: "Optional photo taken at the time of weigh-in." },
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
