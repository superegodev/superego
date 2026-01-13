/////////////////////////////
// Superego built-in types //
/////////////////////////////

export type DocumentRef = {
  collectionId: string;
  documentId: string;
};

//////////////////
// Schema types //
//////////////////

export type Type = 
  | "Breakfast"
  | "MorningSnack"
  | "Lunch"
  | "AfternoonSnack"
  | "Dinner"
  | "EveningSnack";

/** A quantity of mass. */
export type MassQuantity = {
  /** Grams. */
  unit: "g";
  amount: number;
};

/** Note: This is the root type of this schema. */
export type Meal = {
  type: Type;
  /**
   * The date of the meal.
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
  /** Foods consumed during the meal. */
  consumedFoods: Array<{
    /** The Food that was consumed. */
    food: DocumentRef;
    quantity: MassQuantity;
  }>;
};
