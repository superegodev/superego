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
import expenses from "./expensesData.js";

const collection: CollectionEntity = {
  id: Id.generate.collection(),
  settings: {
    name: "Expenses",
    icon: "💸",
    collectionCategoryId: Finance.id,
    description: null,
    assistantInstructions: [
      "- Defaults for things I don't specify:",
      "  - Currency -> EUR.",
      "  - Payment method -> Credit Card.",
    ].join("\n"),
  },
  remote: null,
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
  },
  settings: {
    contentSummaryGetter: {
      source: `
import type { Expense } from "./CollectionSchema.js";

export default function getContentSummary(
  expense: Expense
): Record<string, string | number | boolean | null> {
  return {
    "{position:0,sortable:true} Title": expense.title,
    "{position:1,sortable:true,default-sort:desc} Date": expense.date,
    "{position:2,sortable:true} Amount": expense.amount,
    "{position:3,sortable:true} Currency": expense.currency,
    "{position:4,sortable:true} Category": expense.category,
  };
}
      `.trim(),
      compiled: `
export default function getContentSummary(expense) {
  return {
    "{position:0,sortable:true} Title": expense.title,
    "{position:1,sortable:true,default-sort:desc} Date": expense.date,
    "{position:2,sortable:true} Amount": expense.amount,
    "{position:3,sortable:true} Currency": expense.currency,
    "{position:4,sortable:true} Category": expense.category,
  };
}
      `.trim(),
    },
  },
  migration: null,
  remoteConverters: null,
  createdAt: new Date(),
};

const documents: DocumentEntity[] = [];
const documentVersions: DocumentVersionEntity[] = [];

for (const expense of expenses) {
  const document: DocumentEntity = {
    id: Id.generate.document(),
    remoteId: null,
    collectionId: collection.id,
    createdAt: new Date(),
  };
  const documentVersion: DocumentVersionEntity = {
    id: Id.generate.documentVersion(),
    remoteId: null,
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
