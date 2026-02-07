import { DataType, type Schema } from "@superego/schema";

const weighInsSchema: Schema = {
  types: {
    WeighIn: {
      description: " A single weigh-in.",
      dataType: DataType.Struct,
      properties: {
        timestamp: {
          description: "When the weigh-in occurred.",
          dataType: DataType.String,
          format: "dev.superego:String.Instant",
        },
        weightKg: {
          description: "Weight in kilograms.",
          dataType: DataType.Number,
        },
        scale: {
          description: "Scale used for measurement.",
          dataType: DataType.String,
        },
        notes: {
          dataType: DataType.String,
        },
      },
      nullableProperties: ["notes"],
    },
  },
  rootType: "WeighIn",
};
export default weighInsSchema;
