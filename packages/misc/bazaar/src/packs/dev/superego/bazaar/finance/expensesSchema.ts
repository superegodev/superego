import { DataType, type Schema } from "@superego/schema";

const expensesSchema: Schema = {
  types: {
    Category: {
      description: "Category of the expense.",
      dataType: DataType.Enum,
      members: {
        Housing: {
          description:
            "Rent or mortgage, property taxes, HOA dues, home repairs",
          value: "Housing",
        },
        Utilities: {
          description: "Electricity, gas, water, trash, internet, phone",
          value: "Utilities",
        },
        Groceries: {
          description: "Food and household staples for home",
          value: "Groceries",
        },
        DiningAndTakeout: {
          description: "Restaurants, cafés, delivery, tips",
          value: "Dining And Takeout",
        },
        Transportation: {
          description: "Fuel, public transit, rideshare, parking, maintenance",
          value: "Transportation",
        },
        HealthAndMedical: {
          description: " Doctor visits, dental, prescriptions, copays",
          value: "Health And Medical",
        },
        Insurance: {
          description: "Auto, health, home/renters, life premiums",
          value: "Insurance",
        },
        DebtAndLoans: {
          description: "Credit card payments, student or auto loans",
          value: "Debt And Loans",
        },
        EntertainmentAndSubscriptions: {
          description: "Streaming, games, events, hobbies, apps",
          value: "Entertainment And Subscriptions",
        },
        ShoppingAndPersonalCare: {
          description: "Clothing, toiletries, cosmetics, salon/barber",
          value: "Shopping And Personal Care",
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
        BankTransfer: {
          value: "Bank Transfer",
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
          dataType: DataType.String,
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
};
export default expensesSchema;
