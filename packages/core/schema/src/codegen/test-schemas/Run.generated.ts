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
  content: Uint8Array;
};

//////////////////
// Schema types //
//////////////////

/**
 * Type of running activity.
 */
export enum RunType {
  /**
   * Running on a treadmill.
   */
  Treadmill = "TREADMILL",
  /**
   * Running outdoors on roads or paths.
   */
  Outdoor = "OUTDOOR",
  /**
   * Running on trails.
   */
  Trail = "TRAIL",
}

/**
 * A quantitative measure of perceived exertion during physical activity. Follows the Borg CR10 scale.
 */
export enum RatePerceivedExertion {
  /**
   * No exertion.
   */
  $0 = "0",
  /**
   * Noticeable.
   */
  $05 = "0.5",
  /**
   * Very light.
   */
  $1 = "1",
  /**
   * Light.
   */
  $2 = "2",
  /**
   * Moderate.
   */
  $3 = "3",
  /**
   * Somewhat difficult.
   */
  $4 = "4",
  /**
   * Difficult.
   */
  $5 = "5",
  /**
   * Difficult.
   */
  $6 = "6",
  /**
   * Very difficult.
   */
  $7 = "7",
  /**
   * Very difficult.
   */
  $8 = "8",
  /**
   * Almost maximal.
   */
  $9 = "9",
  /**
   * Maximal.
   */
  $10 = "10",
}

/**
 * General weather condition.
 */
export enum WeatherCondition {
  Sunny = "SUNNY",
  Cloudy = "CLOUDY",
  Rainy = "RAINY",
  Snowy = "SNOWY",
}

/**
 * Weather conditions during the run.
 */
export type Weather = {
  /**
   * Temperature in Celsius.
   */
  temperatureCelsius: number;
  condition: WeatherCondition;
  /**
   * Humidity in percentage.
   */
  humidityPercent: number | null;
};

/**
 * Represents a single running activity performed by the user.
 */
export type Run = {
  /**
   * ISO 8601 timestamp of when the run started.
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
  startTime: string;
  /**
   * Total duration of the run in seconds.
   */
  durationSeconds: number;
  /**
   * Total distance of the run in meters.
   */
  distanceMeters: number;
  type: RunType;
  /**
   * Average pace in minutes per kilometer.
   */
  averagePaceMinPerKm: number | null;
  /**
   * Estimated calories burned.
   */
  caloriesBurned: number | null;
  /**
   * An image file of the route map.
   */
  mapSnapshot: ProtoFile | FileRef | null;
  /**
   * Weather conditions during the run.
   */
  weather: Weather | null;
  /**
   * Indicates if the run was part of a race.
   */
  isRace: boolean;
  /**
   * User's personal notes about the run.
   */
  notes: string | null;
  rpe: RatePerceivedExertion;
};
