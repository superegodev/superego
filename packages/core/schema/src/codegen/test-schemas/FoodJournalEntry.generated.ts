//////////////////
// Schema types //
//////////////////

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

export type FoodJournalEntry = {
  /**
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
  meals: {
    /**
     * Format `dev.superego:String.Instant`:
     *
     * An exact point in time in the ISO8601 format, in "Zulu time", with millisecond precision.
     *
     * Examples:
     *
     * - "2006-08-24T19:39:09.000Z"
     * - "2006-08-24T19:39:09.068Z"
     */
    time: string;
    consumedFoods: {
      foodId: string;
      quantity: MassQuantity;
    }[];
  }[];
};
