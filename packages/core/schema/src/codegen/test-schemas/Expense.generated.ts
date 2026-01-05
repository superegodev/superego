/////////////////////////////
// Superego built-in types //
/////////////////////////////

export type JsonObject = {
  __dataType: "JsonObject";
  [key: string]: any;
};

//////////////////
// Schema types //
//////////////////

/** Category of the expense. */
export type Category = 
  /** Rent or mortgage, property taxes, HOA dues, home repairs. */
  | "Housing"
  /** Electricity, gas, water, trash, internet, phone. */
  | "Utilities"
  /** Food and household staples for home. */
  | "Groceries"
  /** Restaurants, cafés, delivery, tips. */
  | "DiningAndTakeout"
  /** Fuel, public transit, rideshare, parking, maintenance. */
  | "Transportation"
  /**  Doctor visits, dental, prescriptions, copays. */
  | "HealthAndMedical"
  /** Auto, health, home/renters, life premiums. */
  | "Insurance"
  /** Credit card payments, student or auto loans. */
  | "DebtAndLoans"
  /** Streaming, games, events, hobbies, apps. */
  | "EntertainmentAndSubscriptions"
  /** Clothing, toiletries, cosmetics, salon/barber. */
  | "ShoppingAndPersonalCare"
  | "Other";

/** Details of the payment method used. */
export type PaymentMethod = 
  | "Credit Card"
  | "Debit Card"
  | "Cash";

/**
 * Represents a single financial expense.
 *
 * Note: This is the root type of this schema.
 */
export type Expense = {
  /** Short title for the expense. 5 words max. */
  title: string;
  /**
   * Date of the expense.
   *
   * #### Format `dev.superego:String.PlainDate`
   *
   * A calendar date in the ISO 8601 format, with no time and no UTC offset.
   *
   * Format examples:
   * - "2006-08-24"
   * - "2024-02-29"
   */
  date: string;
  /** Amount of the expense. */
  amount: number;
  /** Currency code (e.g., EUR, USD). */
  currency: "EUR";
  category: Category;
  paymentMethod: PaymentMethod | null;
  /**
   * Misc notes.
   *
   * #### Format `dev.superego:JsonObject.TiptapRichText`
   *
   * A rich-text document as represented, in JSON, by the Tiptap rich-text editor.
   *
   * Format examples:
   * - {"__dataType":"JsonObject","type":"doc","content":[]}
   * - {"__dataType":"JsonObject","type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"Hello, World!"}]}]}
   */
  notes: JsonObject | null;
  /** Tags for categorizing and filtering expenses. */
  tags: Array<
    /** Can be deducted from taxable income. */
    | "TaxDeductible"
    /** Eligible for reimbursement from employer. */
    | "Reimbursable"
    /** A recurring expense (subscription, bill, etc.). */
    | "Recurring"> | null;
};
