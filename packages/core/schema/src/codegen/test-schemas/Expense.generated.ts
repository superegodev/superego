/////////////////////////////
// Superego built-in types //
/////////////////////////////

export type FileRef = {
  id: string;
  /**
   * Name + extension.
   * @example book.pdf
   */
  name: string;
  mimeType: string;
};

export type ProtoFile = {
  /**
   * File name + extension.
   * @example book.pdf
   */
  name: string;
  mimeType: string;
  /** The binary content of the file. */
  content: Uint8Array<ArrayBuffer>;
};

//////////////////
// Schema types //
//////////////////

/**
 * Category of the expense.
 */
export enum ExpenseCategory {
  Groceries = "GROCERIES",
  Transport = "TRANSPORT",
  Entertainment = "ENTERTAINMENT",
  Bills = "BILLS",
  Healthcare = "HEALTHCARE",
  Shopping = "SHOPPING",
  Other = "OTHER",
}

/**
 * Details of the payment method used.
 */
export type PaymentMethodDetails = {
  /**
   * e.g., Credit Card, Debit Card, PayPal, Cash
   */
  type: string;
  /**
   * Last 4 digits for card payments.
   */
  last4Digits: string | null;
  /**
   * Card issuer or payment provider.
   */
  issuer: string | null;
};

/**
 * Represents a single financial expense.
 */
export type Expense = {
  /**
   * Date of the expense.
   *
   * Format `dev.superego:String.PlainDate`:
   *
   * A calendar date in the ISO8601 format, not associated with a particular time or time zone.
   *
   * Examples:
   *
   * - "2006-08-24"
   * - "2024-02-29"
   * - "-000924-01-01"
   * - "0924-01-01"
   * - "+010924-01-01"
   */
  date: string;
  /**
   * Amount of the expense.
   */
  amount: number;
  /**
   * Currency code (e.g., EUR, USD).
   */
  currency: "EUR";
  category: ExpenseCategory;
  /**
   * Detailed description of the expense.
   */
  description: string;
  /**
   * Is this a recurring expense?
   */
  isRecurring: boolean;
  /**
   * Scanned or digital receipt file.
   */
  receipt: ProtoFile | FileRef | null;
  paymentMethod: PaymentMethodDetails | null;
  /**
   * List of user-defined tags.
   */
  tags: string[] | null;
};
