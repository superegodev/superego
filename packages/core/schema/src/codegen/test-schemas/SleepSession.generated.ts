//////////////////
// Schema types //
//////////////////

/**
 * Summary of time spent in different sleep stages in minutes.
 */
export type SleepStageSummary = {
  /**
   * Minutes in deep sleep.
   */
  deep: number;
  /**
   * Minutes in light sleep.
   */
  light: number;
  /**
   * Minutes in REM sleep.
   */
  rem: number;
  /**
   * Minutes awake during the sleep period.
   */
  awake: number;
};

/**
 * Details of a sleep interruption.
 */
export type SleepInterruption = {
  /**
   * Timestamp of the interruption.
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
  time: string;
  /**
   * Duration of the interruption in seconds.
   */
  durationSeconds: number;
  /**
   * User-reported reason for interruption.
   */
  reason: string | null;
};

/**
 * Represents a single sleep session.
 */
export type SleepSession = {
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
  startTime: string;
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
  endTime: string;
  /**
   * Total duration in bed in minutes.
   */
  totalDurationMinutes: number;
  /**
   * Calculated actual sleep duration in minutes.
   */
  actualSleepMinutes: number | null;
  /**
   * Sleep quality score (e.g., 0-100).
   *
   * Format `dev.superego:Number.Integer`:
   *
   * An integer
   *
   * Examples:
   *
   * - -1
   * - 0
   * - 1
   */
  qualityScore: number | null;
  sleepStages: SleepStageSummary | null;
  interruptions: SleepInterruption[] | null;
  /**
   * Whether a dream was recorded for this session.
   */
  dreamRecorded: false;
  /**
   * Notes about any dreams.
   */
  dreamNotes: string | null;
};
