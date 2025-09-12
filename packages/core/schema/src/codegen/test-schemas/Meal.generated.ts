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
   * A calendar date in the ISO8601 format, not associated with a particular time or time zone.
   *
   * Format examples:
   * - "2006-08-24"
   * - "2024-02-29"
   */
  date: string;
  /** Foods consumed during the meal. */
  consumedFoods: {
    foodId: string;
    quantity: MassQuantity;
  }[];
};
