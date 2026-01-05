import DataType from "../../DataType.js";
import FormatId from "../../formats/FormatId.js";
import type Schema from "../../Schema.js";

export default {
  types: {
    Category: {
      description: "Category of the expense.",
      dataType: DataType.Enum,
      members: {
        Housing: {
          value: "Housing",
          description:
            "Rent or mortgage, property taxes, HOA dues, home repairs.",
        },
        Utilities: {
          value: "Utilities",
          description: "Electricity, gas, water, trash, internet, phone.",
        },
        Groceries: {
          value: "Groceries",
          description: "Food and household staples for home.",
        },
        DiningAndTakeout: {
          value: "DiningAndTakeout",
          description: "Restaurants, cafés, delivery, tips.",
        },
        Transportation: {
          value: "Transportation",
          description: "Fuel, public transit, rideshare, parking, maintenance.",
        },
        HealthAndMedical: {
          value: "HealthAndMedical",
          description: " Doctor visits, dental, prescriptions, copays.",
        },
        Insurance: {
          value: "Insurance",
          description: "Auto, health, home/renters, life premiums.",
        },
        DebtAndLoans: {
          value: "DebtAndLoans",
          description: "Credit card payments, student or auto loans.",
        },
        EntertainmentAndSubscriptions: {
          value: "EntertainmentAndSubscriptions",
          description: "Streaming, games, events, hobbies, apps.",
        },
        ShoppingAndPersonalCare: {
          value: "ShoppingAndPersonalCare",
          description: "Clothing, toiletries, cosmetics, salon/barber.",
        },
        Other: { value: "Other" },
      },
    },
    PaymentMethod: {
      description: "Details of the payment method used.",
      dataType: DataType.Enum,
      members: {
        CreditCard: { value: "Credit Card" },
        DebitCard: { value: "Debit Card" },
        Cash: { value: "Cash" },
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
          format: FormatId.String.PlainDate,
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
        category: { dataType: null, ref: "Category" },
        paymentMethod: { dataType: null, ref: "PaymentMethod" },
        notes: {
          description: "Misc notes.",
          dataType: DataType.JsonObject,
          format: FormatId.JsonObject.TiptapRichText,
        },
        tags: {
          description: "Tags for categorizing and filtering expenses.",
          dataType: DataType.List,
          items: {
            dataType: DataType.Enum,
            members: {
              TaxDeductible: {
                value: "TaxDeductible",
                description: "Can be deducted from taxable income.",
              },
              Reimbursable: {
                value: "Reimbursable",
                description: "Eligible for reimbursement from employer.",
              },
              Recurring: {
                value: "Recurring",
                description: "A recurring expense (subscription, bill, etc.).",
              },
            },
          },
        },
      },
      nullableProperties: ["paymentMethod", "notes", "tags"],
    },
  },
  rootType: "Expense",
} satisfies Schema;
