import { DataType, type Schema } from "@superego/schema";

export default {
  types: {
    FuelType: {
      description: "Type of fuel that can be used for refuelling.",
      dataType: DataType.Enum,
      members: {
        G95E5: {
          description: "Gasoline, 95 octane, E5",
          value: "G95E5",
        },
        G95E10: {
          value: "G95E10",
        },
        G98E5: {
          value: "G98E5",
        },
        G98E10: {
          value: "G98E10",
        },
      },
    },
    FuelLog: {
      description: "A single refuelling event.",
      dataType: DataType.Struct,
      properties: {
        timestamp: {
          description: "Timestamp of the refueling event.",
          dataType: DataType.String,
          format: "dev.superego:String.Instant",
        },
        odometer: {
          description:
            "Odometer reading at the time of refueling, in kilometers.",
          dataType: DataType.Number,
        },
        liters: {
          description: "Number of liters of fuel added.",
          dataType: DataType.Number,
        },
        totalCost: {
          description: "Total cost of refueling.",
          dataType: DataType.Number,
        },
        fullTank: {
          description: "Indicates if the tank was filled completely.",
          dataType: DataType.Boolean,
        },
        fuelType: {
          description: "Type of fuel used for the refuelling.",
          dataType: null,
          ref: "FuelType",
        },
        notes: {
          description: "Any additional notes.",
          dataType: DataType.JsonObject,
          format: "dev.superego:JsonObject.TiptapRichText",
        },
      },
      nullableProperties: ["fuelType", "notes"],
    },
  },
  rootType: "FuelLog",
} as const satisfies Schema;
