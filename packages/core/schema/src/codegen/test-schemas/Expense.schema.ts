import DataType from "../../DataType.js";
import FormatId from "../../formats/FormatId.js";
import type Schema from "../../Schema.js";

export default {
  types: {
    ExpenseCategory: {
      description: { en: "Category of the expense." },
      dataType: DataType.Enum,
      members: {
        Groceries: { value: "GROCERIES" },
        Transport: { value: "TRANSPORT" },
        Entertainment: { value: "ENTERTAINMENT" },
        Bills: { value: "BILLS" },
        Healthcare: { value: "HEALTHCARE" },
        Shopping: { value: "SHOPPING" },
        Other: { value: "OTHER" },
      },
    },
    PaymentMethodDetails: {
      description: { en: "Details of the payment method used." },
      dataType: DataType.Struct,
      properties: {
        type: {
          description: { en: "e.g., Credit Card, Debit Card, PayPal, Cash" },
          dataType: DataType.String,
        },
        last4Digits: {
          description: { en: "Last 4 digits for card payments." },
          dataType: DataType.String,
        },
        issuer: {
          description: { en: "Card issuer or payment provider." },
          dataType: DataType.String,
        },
      },
      nullableProperties: ["last4Digits", "issuer"],
    },
    Expense: {
      description: { en: "Represents a single financial expense." },
      dataType: DataType.Struct,
      properties: {
        date: {
          description: { en: "Date of the expense." },
          dataType: DataType.String,
          format: FormatId.String.PlainDate,
        },
        amount: {
          description: { en: "Amount of the expense." },
          dataType: DataType.Number,
        },
        currency: {
          description: { en: "Currency code (e.g., EUR, USD)." },
          dataType: DataType.StringLiteral,
          value: "EUR",
        },
        category: { dataType: null, ref: "ExpenseCategory" },
        description: {
          description: { en: "Detailed description of the expense." },
          dataType: DataType.String,
        },
        isRecurring: {
          description: { en: "Is this a recurring expense?" },
          dataType: DataType.Boolean,
        },
        receipt: {
          description: { en: "Scanned or digital receipt file." },
          dataType: DataType.File,
        },
        paymentMethod: { dataType: null, ref: "PaymentMethodDetails" },
        tags: {
          description: { en: "List of user-defined tags." },
          dataType: DataType.List,
          items: { dataType: DataType.String },
        },
      },
      nullableProperties: ["receipt", "paymentMethod", "tags"],
    },
  },
  rootType: "Expense",
} satisfies Schema;
