//////////////////
// Schema types //
//////////////////

/**
 * A single weigh-in.
 *
 * Note: This is the root type of this schema.
 */
export type WeighIn = {
  /**
   * When the weigh-in occurred.
   *
   * #### Format `dev.superego:String.Instant`
   *
   * An exact point in time in the ISO 8601 format, **REQUIRED** to include milliseconds and a time offset.
   *
   * Format examples:
   * - "2006-08-24T19:39:09.000Z"
   * - "2006-08-24T22:39:09.068+03:00"
   */
  timestamp: string;
  /** Weight in kilograms. */
  weightKg: number;
  /** Body fat percentage. */
  bodyFatPercentage: number | null;
  /** Muscle mass in kilograms. */
  muscleMassKg: number | null;
  /** Device used for measurement. */
  measurementDevice: string;
  notes: string | null;
};
