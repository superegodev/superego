import { DocumentVersionCreator } from "@superego/backend";
import type {
  CollectionEntity,
  CollectionVersionEntity,
  DocumentEntity,
  DocumentVersionEntity,
} from "@superego/executing-backend";
import { DataType } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { Finance } from "./collectionCategories.js";
import expenses from "./expenses.json" with { type: "json" };

const collection: CollectionEntity = {
  id: Id.generate.collection(),
  settings: {
    name: "Expenses",
    icon: "💸",
    collectionCategoryId: Finance.id,
    description: null,
    assistantInstructions: [
      "- If the currency is not supplied, default to EUR.",
      "- If the payment method is not supplied, default to Credit Card.",
    ].join("\n"),
  },
  createdAt: new Date(),
};

const collectionVersion: CollectionVersionEntity = {
  id: Id.generate.collectionVersion(),
  previousVersionId: null,
  collectionId: collection.id,
  schema: {
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
            description:
              "Fuel, public transit, rideshare, parking, maintenance",
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
  settings: {
    contentSummaryGetter: {
      source: `
import type { Expense } from "./CollectionSchema";

export default function getContentSummary(
  expense: Expense
): Record<string, string> {
  return {
    "0. Title": expense.title,
    "1. Date": expense.date,
    "2. Amount": \`\${expense.amount} \${expense.currency}\`,
    "3. Category": expense.category,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(expense) {
  return {
    "0. Title": expense.title,
    "1. Date": expense.date,
    "2. Amount": \`\${expense.amount} \${expense.currency}\`,
    "3. Category": expense.category,
  };
}
      `.trim(),
    },
  },
  migration: null,
  createdAt: new Date(),
};

const documents: DocumentEntity[] = [];
const documentVersions: DocumentVersionEntity[] = [];

for (const expense of expenses) {
  const document: DocumentEntity = {
    id: Id.generate.document(),
    collectionId: collection.id,
    createdAt: new Date(),
  };
  const documentVersion: DocumentVersionEntity = {
    id: Id.generate.documentVersion(),
    previousVersionId: null,
    collectionId: collection.id,
    documentId: document.id,
    collectionVersionId: collectionVersion.id,
    conversationId: null,
    content: expense,
    createdBy: DocumentVersionCreator.User,
    createdAt: new Date(),
  };
  documents.push(document);
  documentVersions.push(documentVersion);
}

export default { collection, collectionVersion, documents, documentVersions };
