import { DataType } from "@superego/schema";
import type { CollectionDefinition } from "./FactotumObject/createCollection.js";

export const fuelLogs = (documentContents: object[]): CollectionDefinition => ({
  name: "Fuel Logs",
  description: "Tracks when I refuel my vehicles.",
  assistantInstructions: [
    "- Use reasonable values for liters and total cost. E.g., if I say I put 5304 liters, I probably mean 53.04, even if I didn't specify the decimal",
    "- Default to full tank if I don't specify it.",
  ].join("\n"),
  schema: {
    types: {
      Vehicle: {
        description: "My vehicles.",
        dataType: DataType.Enum,
        members: {
          KiaSportage: {
            description: "My main car.",
            value: "Kia Sportage",
          },
          KawasakiNinja: {
            description: "My motorbike.",
            value: "Kawasaki Ninja",
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
          notes: {
            description: "Any additional notes.",
            dataType: DataType.JsonObject,
            format: "dev.superego:JsonObject.TiptapRichText",
          },
        },
        nullableProperties: ["notes"],
      },
    },
    rootType: "FuelLogEntry",
  },
  documentContents: documentContents,
});
