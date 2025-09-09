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
          SuzukiJimny: {
            description: "My off-roader.",
            value: "Suzuki Jimny",
          },
        },
      },
      FuelLogEntry: {
        description: "A single refuelling event.",
        dataType: DataType.Struct,
        properties: {
          timestamp: {
            description: "Timestamp of the refueling event.",
            dataType: DataType.String,
            format: "dev.superego:String.Instant",
          },
          vehicle: {
            description: "Which vehicle was refuelled.",
            dataType: null,
            ref: "Vehicle",
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
          odometer: {
            description:
              "Odometer reading at the time of refueling, in kilometers.",
            dataType: DataType.Number,
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

export const calendar = (documentContents: object[]): CollectionDefinition => ({
  name: "Calendar",
  description: "My personal calendar.",
  assistantInstructions: [
    "- If the duration is not supplied for events, default to them being 1 hour long.",
  ].join("\n"),
  schema: {
    types: {
      Type: {
        description: "Type of a calendar entry.",
        dataType: DataType.Enum,
        members: {
          Event: {
            description:
              "An event, with a defined start time and a defined end time.",
            value: "Event",
          },
          Reminder: {
            description:
              "A reminder, with a defined start time but no end time.",
            value: "Reminder",
          },
        },
      },
      CalendarEntry: {
        description: "An entry in my calendar.",
        dataType: DataType.Struct,
        properties: {
          type: {
            description: "The type of the entry.",
            dataType: null,
            ref: "Type",
          },
          title: {
            description: "Short title for the entry. 5 words max.",
            dataType: DataType.String,
          },
          startTime: {
            description: "When the event or reminder starts.",
            dataType: DataType.String,
            format: "dev.superego:String.Instant",
          },
          endTime: {
            description: "When the event or reminder ends. Null for reminders.",
            dataType: DataType.String,
            format: "dev.superego:String.Instant",
          },
          notes: {
            description: "Misc notes.",
            dataType: DataType.JsonObject,
            format: "dev.superego:JsonObject.TiptapRichText",
          },
        },
        nullableProperties: ["endTime", "notes"],
      },
    },
    rootType: "CalendarEntry",
  },
  documentContents: documentContents,
});
