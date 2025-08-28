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

/**
 * Category of the expense.
 */
export enum Category {
  /**
   * Rent or mortgage, property taxes, HOA dues, home repairs.
   */
  Housing = "Housing",
  /**
   * Electricity, gas, water, trash, internet, phone.
   */
  Utilities = "Utilities",
  /**
   * Food and household staples for home.
   */
  Groceries = "Groceries",
  /**
   * Restaurants, cafés, delivery, tips.
   */
  DiningAndTakeout = "DiningAndTakeout",
  /**
   * Fuel, public transit, rideshare, parking, maintenance.
   */
  Transportation = "Transportation",
  /**
   *  Doctor visits, dental, prescriptions, copays.
   */
  HealthAndMedical = "HealthAndMedical",
  /**
   * Auto, health, home/renters, life premiums.
   */
  Insurance = "Insurance",
  /**
   * Credit card payments, student or auto loans.
   */
  DebtAndLoans = "DebtAndLoans",
  /**
   * Streaming, games, events, hobbies, apps.
   */
  EntertainmentAndSubscriptions = "EntertainmentAndSubscriptions",
  /**
   * Clothing, toiletries, cosmetics, salon/barber.
   */
  ShoppingAndPersonalCare = "ShoppingAndPersonalCare",
  Other = "Other",
}

/**
 * Details of the payment method used.
 */
export enum PaymentMethod {
  CreditCard = "Credit Card",
  DebitCard = "Debit Card",
  Cash = "Cash",
}

/**
 * Represents a single financial expense.
 *
 * Note: This is the root type of this schema.
 */
export type Expense = {
  /**
   * Short title for the expense. 5 words max.
   */
  title: string;
  /**
   * Date of the expense.
   *
   * ## Format `dev.superego:String.PlainDate`
   *
   * A calendar date in the ISO8601 format, not associated with a particular time or time zone.
   *
   * ### Examples
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
  category: Category;
  paymentMethod: PaymentMethod | null;
  /**
   * Misc notes.
   *
   * ## Format `dev.superego:JsonObject.TiptapRichText`
   *
   * A rich-text document as represented, in JSON, by the Tiptap rich-text editor.
   *
   * ### Examples
   *
   * - {"__dataType":"JsonObject","type":"doc","content":[]}
   * - {"__dataType":"JsonObject","type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"Hello, World!"}]}]}
   */
  notes: JsonObject | null;
};
