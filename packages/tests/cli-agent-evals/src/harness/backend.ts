import { AssistantName, type CollectionId, Theme } from "@superego/backend";
import { ExecutingBackend } from "@superego/executing-backend";
import { MultiDriverInferenceServiceFactory } from "@superego/multi-driver-inference-service";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/nodejs";
import { DataType, FormatId, type Schema } from "@superego/schema";
import { SqliteDataRepositoriesManager } from "@superego/sqlite-data-repositories";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import { assert } from "vitest";

export function createEvalBackend(databaseFile: string): ExecutingBackend {
  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName: databaseFile,
    defaultGlobalSettings: {
      appearance: { theme: Theme.Auto },
      inference: {
        providers: [],
        defaultInferenceOptions: {
          completion: null,
          transcription: null,
          fileInspection: null,
        },
      },
      assistants: {
        userInfo: null,
        userPreferences: null,
        developerPrompts: {
          [AssistantName.Factotum]: null,
          [AssistantName.CollectionCreator]: null,
        },
      },
    },
  });
  dataRepositoriesManager.runMigrations();
  return new ExecutingBackend(
    dataRepositoriesManager,
    new QuickjsJavascriptSandbox(),
    new TscTypescriptCompiler(),
    new MultiDriverInferenceServiceFactory(),
    [],
  );
}

export async function seedExpensesCollection(backend: ExecutingBackend) {
  const result = await backend.collections.create({
    settings: {
      name: "Expenses",
      icon: null,
      collectionCategoryId: null,
      defaultCollectionViewAppId: null,
      description: "Personal expense records",
      assistantInstructions: null,
      redirectToCollectionAfterDocumentCreation: false,
    },
    schema: expensesSchema,
    versionSettings: defaultVersionSettings,
  });
  assert.isTrue(result.success);
  return result.data;
}

export async function seedLegacyExpensesCollection(backend: ExecutingBackend) {
  const result = await backend.collections.create({
    settings: {
      name: "Expenses",
      icon: null,
      collectionCategoryId: null,
      defaultCollectionViewAppId: null,
      description: "Personal expense records without payment method tracking",
      assistantInstructions: null,
      redirectToCollectionAfterDocumentCreation: false,
    },
    schema: legacyExpensesSchema,
    versionSettings: defaultVersionSettings,
  });
  assert.isTrue(result.success);
  return result.data;
}

export async function seedExpenseDocuments(
  backend: ExecutingBackend,
  collectionId: string,
) {
  const contents = [
    {
      date: "2026-02-01",
      amount: 18.5,
      currency: "USD",
      merchant: "Blue Bottle",
      category: "Coffee",
      paymentMethod: "Credit Card",
      reimbursable: false,
      notes: "Morning coffee beans",
    },
    {
      date: "2026-02-03",
      amount: 86.2,
      currency: "USD",
      merchant: "Amtrak",
      category: "Travel",
      paymentMethod: "Credit Card",
      reimbursable: true,
      notes: "Client visit train ticket",
    },
    {
      date: "2026-02-05",
      amount: 42,
      currency: "USD",
      merchant: "Local Market",
      category: "Groceries",
      paymentMethod: "Debit Card",
      reimbursable: false,
      notes: "Weekly groceries",
    },
  ];
  for (const content of contents) {
    const result = await backend.documents.create({
      collectionId: collectionId as CollectionId,
      content,
    });
    assert.isTrue(result.success);
  }
  return contents;
}

export async function seedLegacyExpenseDocuments(
  backend: ExecutingBackend,
  collectionId: string,
) {
  const contents = [
    {
      date: "2026-02-01",
      amount: 18.5,
      currency: "USD",
      merchant: "Blue Bottle",
      category: "Coffee",
      reimbursable: false,
      notes: "Morning coffee beans",
    },
    {
      date: "2026-02-03",
      amount: 86.2,
      currency: "USD",
      merchant: "Amtrak",
      category: "Travel",
      reimbursable: true,
      notes: "Client visit train ticket",
    },
  ];
  for (const content of contents) {
    const result = await backend.documents.create({
      collectionId: collectionId as CollectionId,
      content,
    });
    assert.isTrue(result.success);
  }
  return contents;
}

export const defaultVersionSettings = {
  contentBlockingKeysGetter: null,
  contentSummaryGetter: {
    source: "",
    compiled: [
      "export default function getContentSummary(content) {",
      "  return {",
      "    Date: content.date,",
      "    Merchant: content.merchant,",
      "    Amount: content.amount,",
      "    Category: content.category",
      "  };",
      "}",
    ].join("\n"),
  },
  defaultDocumentViewUiOptions: null,
};

export const expensesSchema: Schema = {
  types: {
    Expense: {
      dataType: DataType.Struct,
      properties: {
        date: {
          dataType: DataType.String,
          format: FormatId.String.PlainDate,
        },
        amount: { dataType: DataType.Number },
        currency: { dataType: DataType.String },
        merchant: { dataType: DataType.String },
        category: { dataType: DataType.String },
        paymentMethod: { dataType: DataType.String },
        reimbursable: { dataType: DataType.Boolean },
        notes: {
          dataType: DataType.String,
          format: FormatId.String.Markdown,
        },
      },
    },
  },
  rootType: "Expense",
};

export const legacyExpensesSchema: Schema = {
  types: {
    Expense: {
      dataType: DataType.Struct,
      properties: {
        date: {
          dataType: DataType.String,
          format: FormatId.String.PlainDate,
        },
        amount: { dataType: DataType.Number },
        currency: { dataType: DataType.String },
        merchant: { dataType: DataType.String },
        category: { dataType: DataType.String },
        reimbursable: { dataType: DataType.Boolean },
        notes: {
          dataType: DataType.String,
          format: FormatId.String.Markdown,
        },
      },
    },
  },
  rootType: "Expense",
};
