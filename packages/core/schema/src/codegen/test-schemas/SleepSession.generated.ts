//////////////////
// Schema types //
//////////////////

/** Summary of time spent in different sleep stages in minutes. */
export type SleepStageSummary = {
  /** Minutes in deep sleep. */
  deep: number;
  /** Minutes in light sleep. */
  light: number;
  /** Minutes in REM sleep. */
  rem: number;
  /** Minutes awake during the sleep period. */
  awake: number;
};

/** Details of a sleep interruption. */
export type SleepInterruption = {
  /**
   * Timestamp of the interruption.
   *
   * #### Format `dev.superego:String.Instant`
   *
   * An exact point in time in the ISO8601 format, with millisecond precision, with a specified time offset.
   *
   * Format examples:
   * - "2006-08-24T19:39:09.000Z"
   * - "2006-08-24T22:39:09.068+03:00"
   */
  time: string;
  /** Duration of the interruption in seconds. */
  durationSeconds: number;
  /** User-reported reason for interruption. */
  reason: string | null;
};

/**
 * Represents a single sleep session.
 *
 * Note: This is the root type of this schema.
 */
export type SleepSession = {
  /**
   * #### Format `dev.superego:String.Instant`
   *
   * An exact point in time in the ISO8601 format, with millisecond precision, with a specified time offset.
   *
   * Format examples:
   * - "2006-08-24T19:39:09.000Z"
   * - "2006-08-24T22:39:09.068+03:00"
   */
  startTime: string;
  /**
   * #### Format `dev.superego:String.Instant`
   *
   * An exact point in time in the ISO8601 format, with millisecond precision, with a specified time offset.
   *
   * Format examples:
   * - "2006-08-24T19:39:09.000Z"
   * - "2006-08-24T22:39:09.068+03:00"
   */
  endTime: string;
  /** Total duration in bed in minutes. */
  totalDurationMinutes: number;
  /** Calculated actual sleep duration in minutes. */
  actualSleepMinutes: number | null;
  /**
   * Sleep quality score (e.g., 0-100).
   *
   * #### Format `dev.superego:Number.Integer`
   *
   * An integer
   *
   * Format examples:
   * - -1
   * - 0
   */
  qualityScore: number | null;
  sleepStages: SleepStageSummary | null;
  interruptions: SleepInterruption[] | null;
  /** Whether a dream was recorded for this session. */
  dreamRecorded: false;
  /** Notes about any dreams. */
  dreamNotes: string | null;
};
