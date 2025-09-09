import { DataType } from "@superego/schema";
import type { CollectionDefinition } from "./FactotumObject/createCollection.js";

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

export const contacts = (documentContents: object[]): CollectionDefinition => ({
  name: "Contacts",
  description: "Address book of my contacts.",
  assistantInstructions: null,
  schema: {
    types: {
      Type: {
        description: "Type of contact.",
        dataType: DataType.Enum,
        members: {
          Person: {
            description: "A single human.",
            value: "Person",
          },
          Organization: {
            description:
              "A company, non-profit, government entity, group, etc.",
            value: "Organization",
          },
        },
      },
      Phone: {
        dataType: DataType.Struct,
        properties: {
          number: {
            description: "The actual phone number.",
            dataType: DataType.String,
          },
          description: {
            description:
              "A description for the phone number. (Personal, work, etc.)",
            dataType: DataType.String,
          },
        },
        nullableProperties: ["description"],
      },
      Email: {
        dataType: DataType.Struct,
        properties: {
          address: {
            description: "The actual email address.",
            dataType: DataType.String,
          },
          description: {
            description:
              "A description for the email address. (Personal, work, etc.)",
            dataType: DataType.String,
          },
        },
        nullableProperties: ["description"],
      },
      Contact: {
        description: "A contact in my address book.",
        dataType: DataType.Struct,
        properties: {
          type: {
            dataType: null,
            ref: "Type",
          },
          name: {
            description:
              "Name of the contact. Either the full name for a person, or the organization name for an organization.",
            dataType: DataType.String,
          },
          relation: {
            description: "Who they are to me.",
            dataType: DataType.String,
          },
          phones: {
            description: "Their phone numbers",
            dataType: DataType.List,
            items: {
              dataType: null,
              ref: "Phone",
            },
          },
          emails: {
            description: "Their email addresses",
            dataType: DataType.List,
            items: {
              dataType: null,
              ref: "Email",
            },
          },
          notes: {
            description: "Misc notes about the contact",
            dataType: DataType.JsonObject,
            format: "dev.superego:JsonObject.TiptapRichText",
          },
        },
        nullableProperties: ["relation", "notes"],
      },
    },
    rootType: "Contact",
  },
  documentContents: documentContents,
});

export const expenses = (documentContents: object[]): CollectionDefinition => ({
  name: "Expenses",
  description: "A log of my expenses.",
  assistantInstructions: [
    "- Each expense must be recorded separately.",
    "- If the currency is not provided, default to Euros",
    "- If the payment method is not provided, default to Credit Card.",
  ].join("\n"),
  schema: {
    types: {
      Category: {
        description: "Category of the expense.",
        dataType: DataType.Enum,
        members: {
          Housing: {
            description:
              "Rent or mortgage, property taxes, HOA dues, home repairs.",
            value: "Housing",
          },
          Utilities: {
            description: "Electricity, gas, water, trash, internet, phone.",
            value: "Utilities",
          },
          Groceries: {
            description: "Food and household staples for home.",
            value: "Groceries",
          },
          DiningAndTakeout: {
            description: "Restaurants, cafés, delivery, tips.",
            value: "Dining And Takeout",
          },
          Transportation: {
            description:
              "Fuel, public transit, rideshare, parking, maintenance.",
            value: "Transportation",
          },
          HealthAndMedical: {
            description: " Doctor visits, dental, prescriptions, copays.",
            value: "Health And Medical",
          },
          Insurance: {
            description: "Auto, health, home/renters, life premiums.",
            value: "Insurance",
          },
          DebtAndLoans: {
            description: "Credit card payments, student or auto loans.",
            value: "Debt And Loans",
          },
          EntertainmentAndSubscriptions: {
            description: "Streaming, games, events, hobbies, apps.",
            value: "Entertainment And Subscriptions",
          },
          ShoppingAndPersonalCare: {
            description: "Clothing, toiletries, cosmetics, salon/barber.",
            value: "Shopping And PersonalCare",
          },
          Other: {
            value: "Other",
          },
        },
      },
      PaymentMethod: {
        description: "Details of the payment method used.",
        dataType: DataType.Enum,
        members: {
          CreditCard: {
            value: "Credit Card",
          },
          DebitCard: {
            value: "Debit Card",
          },
          Cash: {
            value: "Cash",
          },
        },
      },
      Expense: {
        description: "Represents a single financial expense.",
        dataType: DataType.Struct,
        properties: {
          title: {
            description: "Short title for the expense. 5 words max.",
            dataType: DataType.String,
          },
          date: {
            description: "Date of the expense.",
            dataType: DataType.String,
            format: "dev.superego:String.PlainDate",
          },
          amount: {
            description: "Amount of the expense.",
            dataType: DataType.Number,
          },
          currency: {
            description: "Currency code (e.g., EUR, USD).",
            dataType: DataType.StringLiteral,
            value: "EUR",
          },
          category: {
            dataType: null,
            ref: "Category",
          },
          paymentMethod: {
            dataType: null,
            ref: "PaymentMethod",
          },
          notes: {
            description: "Misc notes.",
            dataType: DataType.JsonObject,
            format: "dev.superego:JsonObject.TiptapRichText",
          },
        },
        nullableProperties: ["paymentMethod", "notes"],
      },
    },
    rootType: "Expense",
  },
  documentContents: documentContents,
});

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

export const vetVisits = (
  documentContents: object[],
): CollectionDefinition => ({
  name: "Vet Visits",
  description: "Log of visits to the vet for my pets.",
  assistantInstructions: null,
  schema: {
    types: {
      Pet: {
        description: "My pets.",
        dataType: DataType.Enum,
        members: {
          Galois: {
            description: "Cat.",
            value: "Galois",
          },
          Abel: {
            description: "Dog.",
            value: "Abel",
          },
        },
      },
      VetVisit: {
        description: "A visit to the vet.",
        dataType: DataType.Struct,
        properties: {
          pet: {
            description: "Which pet was brought.",
            dataType: null,
            ref: "Pet",
          },
          date: {
            description: "Date of the visit.",
            dataType: DataType.String,
            format: "dev.superego:String.PlainDate",
          },
          title: {
            description: "Short title for the visit. 5 words max.",
            dataType: DataType.String,
          },
          vet: {
            description: "Which vet the pet was brought to.",
            dataType: DataType.String,
          },
          notes: {
            description:
              "Details about the visit. What the vet said, what they prescribed, etc.",
            dataType: DataType.JsonObject,
            format: "dev.superego:JsonObject.TiptapRichText",
          },
        },
        nullableProperties: ["notes"],
      },
    },
    rootType: "VetVisit",
  },
  documentContents: documentContents,
});
