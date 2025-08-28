//////////////////
// Schema types //
//////////////////

export enum Type {
  Breakfast = "Breakfast",
  MorningSnack = "MorningSnack",
  Lunch = "Lunch",
  AfternoonSnack = "AfternoonSnack",
  Dinner = "Dinner",
  EveningSnack = "EveningSnack",
}

/**
 * A quantity of mass.
 */
export type MassQuantity = {
  /**
   * Grams.
   */
  unit: "g";
  amount: number;
};

/**
 * Note: This is the root type of this schema.
 */
export type Meal = {
  type: Type;
  /**
   * The date of the meal.
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
   * Foods consumed during the meal.
   */
  consumedFoods: {
    foodId: string;
    quantity: MassQuantity;
  }[];
};
