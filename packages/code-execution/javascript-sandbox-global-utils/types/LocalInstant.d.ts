/**
 * Helper for working with dates and times in the user's timezone.
 *
 * Notes:
 * - Instances are immutable. Every method returns a new instance.
 * - Primitive coercion:
 *   - To number → milliseconds since Unix epoch (UTC).
 *   - To string → ISO 8601 string with the time offset of the user's timezone.
 * - You can use >, <, >=, <= to compare instances.
 *
 * This class is defined in the global scope. Don't import or require it.
 */
declare class LocalInstant {
  private constructor();
  /** Get a new LocalInstant set at the beginning of the given time unit. */
  startOf(timeUnit: LocalInstant.TimeUnit): LocalInstant;
  /**
   * Get a new LocalInstant set at the end (meaning the last millisecond) of the
   * given time unit.
   */
  endOf(timeUnit: LocalInstant.TimeUnit): LocalInstant;
  /**
   * Get a new LocalInstant increased by the given duration. Adding hours,
   * minutes, seconds, or milliseconds increases the timestamp by the right
   * number of milliseconds. Adding days, months, or years shifts the calendar,
   * accounting for DSTs and leap years along the way.
   */
  plus(duration: LocalInstant.Duration): LocalInstant;
  /**
   * Get a new LocalInstant decreased by the given duration. Subtracting hours,
   * minutes, seconds, or milliseconds decreases the timestamp by the right
   * number of milliseconds. Subtracting days, months, or years shifts the
   * calendar, accounting for DSTs and leap years along the way.
   */
  minus(duration: LocalInstant.Duration): LocalInstant;
  /** Get a new LocalInstant with set to the specified units. */
  set(dateUnits: LocalInstant.DateUnits): LocalInstant;
  /**
   * Returns the ISO8601 representation of the instant, with the time offset of
   * the user's timezone. (I.e., a string in `dev.superego:String.Instant`
   * format.)
   */
  toISO(): string;
  toJSDate(): Date;
  /**
   * Creates a LocalInstant from any valid ISO8601 string. If the string doesn't
   * have a time offset, the offset of the user's timezone will be used. Throws
   * if the string is not a valid ISO string.
   */
  static fromISO(iso: string): LocalInstant;
  /** Creates a LocalInstant for the current time. */
  static now(): LocalInstant;
  /**
   * Creates a LocalInstant from a string with `dev.superego:String.Instant`
   * format. Throws if the string is not a valid Instant.
   */
  static fromInstant(
    /**
     * String in `dev.superego:String.Instant` format: an exact point in time in
     * the ISO8601 format, with mandatory millisecond precision, with a specific
     * time offset.
     */
    instant: string,
  ): LocalInstant;
  /**
   * Creates a LocalInstant from a string with `dev.superego:String.PlainDate`
   * format. Throws if the string is not a valid PlainDate. The instant is set
   * to the start-of-day of the supplied date in the user's timezone.
   */
  static fromPlainDate(
    /**
     * String in `dev.superego:String.PlainDate` format: a calendar date in the
     * ISO8601 format, with no time and no time offset.
     */
    plainDate: string,
  ): LocalInstant;
}
declare namespace LocalInstant {
  interface DateUnits {
    /** A year, such as 1987. */
    year?: number | undefined;
    /** A month, 1-12. */
    month?: number | undefined;
    /** A day of the month, 1-31, depending on the month. */
    day?: number | undefined;
    /** An ISO weekday, 1-7, where 1 is Monday and 7 is Sunday. */
    isoWeekday?: number | undefined;
    /** Hour of the day, 0-23. */
    hour?: number | undefined;
    /** Minute of the hour, 0-59. */
    minute?: number | undefined;
    /** Second of the minute, 0-59. */
    second?: number | undefined;
    /** Millisecond of the second, 0-999. */
    millisecond?: number | undefined;
  }
  type TimeUnit =
    | "year"
    | "quarter"
    | "month"
    | "week"
    | "day"
    | "hour"
    | "minute"
    | "second"
    | "millisecond";
  interface Duration {
    years?: number | undefined;
    quarters?: number | undefined;
    months?: number | undefined;
    weeks?: number | undefined;
    days?: number | undefined;
    hours?: number | undefined;
    minutes?: number | undefined;
    seconds?: number | undefined;
    milliseconds?: number | undefined;
  }
}
