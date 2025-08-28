import DataType from "../DataType.js";
import FormatId from "../formats/FormatId.js";
import type Schema from "../Schema.js";

export default {
  types: {
    FuelType: {
      description: "Type of fuel that can be used for refuelling.",
      dataType: DataType.Enum,
      members: {
        Gasoline95: {
          value: "Gasoline 95",
          description: "95 octane gasoline.",
        },
        Gasoline98: {
          value: "Gasoline 98",
          description: "98 octane gasoline.",
        },
      },
    },
    Vehicle: {
      description: "My vehicles.",
      dataType: DataType.Enum,
      members: {
        KiaSportage: {
          value: "Kia Sportage",
          description: "My main car.",
        },
        KawasakiNinja: {
          value: "Kawasaki Ninja",
          description: "My motorbike.",
        },
      },
    },
    FuelLogEntry: {
      description: "A single refuelling event.",
      dataType: DataType.Struct,
      properties: {
        vehicle: {
          description: "Which vehicle was refuelled.",
          dataType: null,
          ref: "Vehicle",
        },
        timestamp: {
          description: "Timestamp of the refueling event.",
          dataType: DataType.String,
          format: FormatId.String.Instant,
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
        pricePerLiter: {
          description: "Price per liter of fuel.",
          dataType: DataType.Number,
        },
        fuelType: {
          description: "Type of fuel used for the refuelling.",
          dataType: null,
          ref: "FuelType",
        },
        notes: {
          description: "Any additional notes.",
          dataType: DataType.JsonObject,
          format: FormatId.JsonObject.TiptapRichText,
        },
      },
      nullableProperties: ["pricePerLiter", "fuelType", "notes"],
    },
  },
  rootType: "FuelLogEntry",
} satisfies Schema;
