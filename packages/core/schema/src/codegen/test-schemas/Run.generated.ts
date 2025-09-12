/////////////////////////////
// Superego built-in types //
/////////////////////////////

export type FileRef = {
  id: string;
  /**
   * File name + extension.
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

/** Type of running activity. */
export type RunType = 
  /** Running on a treadmill. */
  | "TREADMILL"
  /** Running outdoors on roads or paths. */
  | "OUTDOOR"
  /** Running on trails. */
  | "TRAIL";

/** A quantitative measure of perceived exertion during physical activity. Follows the Borg CR10 scale. */
export type RatePerceivedExertion = 
  /** No exertion. */
  | "0"
  /** Noticeable. */
  | "0.5"
  /** Very light. */
  | "1"
  /** Light. */
  | "2"
  /** Moderate. */
  | "3"
  /** Somewhat difficult. */
  | "4"
  /** Difficult. */
  | "5"
  /** Difficult. */
  | "6"
  /** Very difficult. */
  | "7"
  /** Very difficult. */
  | "8"
  /** Almost maximal. */
  | "9"
  /** Maximal. */
  | "10";

/** General weather condition. */
export type WeatherCondition = 
  | "SUNNY"
  | "CLOUDY"
  | "RAINY"
  | "SNOWY";

/** Weather conditions during the run. */
export type Weather = {
  /** Temperature in Celsius. */
  temperatureCelsius: number;
  condition: WeatherCondition;
  /** Humidity in percentage. */
  humidityPercent: number | null;
};

/**
 * Represents a single running activity performed by the user.
 *
 * Note: This is the root type of this schema.
 */
export type Run = {
  /**
   * ISO 8601 timestamp of when the run started.
   *
   * #### Format `dev.superego:String.Instant`
   *
   * An exact point in time in the ISO8601 format, with millisecond precision, with a specified time offset.
   *
   * Format examples:
   * - "2006-08-24T19:39:09.000Z"
   * - "2006-08-24T22:39:09.068+03:00"
   */
  startTime: string;
  /** Total duration of the run in seconds. */
  durationSeconds: number;
  /** Total distance of the run in meters. */
  distanceMeters: number;
  type: RunType;
  /** Average pace in minutes per kilometer. */
  averagePaceMinPerKm: number | null;
  /** Estimated calories burned. */
  caloriesBurned: number | null;
  /** An image file of the route map. */
  mapSnapshot: ProtoFile | FileRef | null;
  /** Weather conditions during the run. */
  weather: Weather | null;
  /** Indicates if the run was part of a race. */
  isRace: boolean;
  /** User's personal notes about the run. */
  notes: string | null;
  rpe: RatePerceivedExertion;
};
