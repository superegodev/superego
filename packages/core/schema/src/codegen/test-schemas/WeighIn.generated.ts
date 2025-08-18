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
 * User's subjective feeling at the time of weigh-in.
 */
export enum Feeling {
  Great = "GREAT",
  Good = "GOOD",
  Neutral = "NEUTRAL",
  Bad = "BAD",
  Terrible = "TERRIBLE",
}

/**
 * Represents a single weigh-in event for the user.
 */
export type WeighIn = {
  /**
   * When the weigh-in occurred.
   *
   * Format `dev.superego:String.Instant`:
   *
   * An exact point in time in the ISO8601 format, in "Zulu time", with millisecond precision.
   *
   * Examples:
   *
   * - "2006-08-24T19:39:09.000Z"
   * - "2006-08-24T19:39:09.068Z"
   */
  timestamp: string;
  /**
   * Weight in kilograms.
   */
  weightKg: number;
  /**
   * Body fat percentage.
   */
  bodyFatPercentage: number | null;
  /**
   * Muscle mass in kilograms.
   */
  muscleMassKg: number | null;
  /**
   * Device used for measurement.
   */
  measurementDevice: "SmartScale V3 Pro";
  feeling: Feeling | null;
  /**
   * Optional photo taken at the time of weigh-in.
   */
  progressPhoto: ProtoFile | FileRef | null;
  notes: string | null;
};
