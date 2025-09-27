import { FormatId, utils } from "@superego/schema";
import { DateTime, type WeekdayNumbers } from "luxon";

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
class LocalInstant {
  private constructor(
    /** @internal */
    private dateTime: DateTime<true>,
  ) {}

  /** Get a new LocalInstant set at the beginning of the given time unit. */
  startOf(timeUnit: LocalInstant.TimeUnit): LocalInstant {
    return new LocalInstant(this.dateTime.startOf(timeUnit));
  }

  /**
   * Get a new LocalInstant set at the end (meaning the last millisecond) of the
   * given time unit.
   */
  endOf(timeUnit: LocalInstant.TimeUnit): LocalInstant {
    return new LocalInstant(this.dateTime.endOf(timeUnit));
  }

  /**
   * Get a new LocalInstant increased by the given duration. Adding hours,
   * minutes, seconds, or milliseconds increases the timestamp by the right
   * number of milliseconds. Adding days, months, or years shifts the calendar,
   * accounting for DSTs and leap years along the way.
   */
  plus(duration: LocalInstant.Duration): LocalInstant {
    return new LocalInstant(this.dateTime.plus(duration));
  }

  /**
   * Get a new LocalInstant decreased by the given duration. Subtracting hours,
   * minutes, seconds, or milliseconds decreases the timestamp by the right
   * number of milliseconds. Subtracting days, months, or years shifts the
   * calendar, accounting for DSTs and leap years along the way.
   */
  minus(duration: LocalInstant.Duration): LocalInstant {
    return new LocalInstant(this.dateTime.minus(duration));
  }

  /** Get a new LocalInstant with set to the specified units. */
  set(dateUnits: LocalInstant.DateUnits): LocalInstant {
    return new LocalInstant(
      this.dateTime.set({
        year: dateUnits.year,
        month: dateUnits.month,
        day: dateUnits.day,
        weekday: dateUnits.isoWeekday as WeekdayNumbers,
        hour: dateUnits.hour,
        minute: dateUnits.minute,
        second: dateUnits.second,
        millisecond: dateUnits.millisecond,
      }),
    );
  }

  /**
   * Returns the ISO8601 representation of the instant, with the time offset of
   * the user's timezone. (I.e., a string in `dev.superego:String.Instant`
   * format.)
   */
  toISO(): string {
    return this.dateTime.toISO({
      includeOffset: true,
      precision: "millisecond",
    });
  }

  toJSDate(): Date {
    return this.dateTime.toJSDate();
  }

  /** @internal */
  [Symbol.toPrimitive](hint: string) {
    if (hint === "number") {
      return this.dateTime.toMillis();
    }
    if (hint === "string") {
      return this.toISO();
    }
    return null;
  }

  /**
   * Creates a LocalInstant from any valid ISO8601 string. If the string doesn't
   * have a time offset, the offset of the user's timezone will be used. Throws
   * if the string is not a valid ISO string.
   */
  static fromISO(iso: string) {
    return new LocalInstant(LocalInstant.parse(iso));
  }

  /** Creates a LocalInstant for the current time. */
  static now() {
    return new LocalInstant(DateTime.now());
  }

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
  ) {
    if (!utils.isValidInstant(instant)) {
      throw new Error(`"${instant}" is not a valid ${FormatId.String.Instant}`);
    }
    return new LocalInstant(LocalInstant.parse(instant));
  }

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
  ) {
    if (!utils.isValidPlainDate(plainDate)) {
      throw new Error(
        `"${plainDate}" is not a valid ${FormatId.String.PlainDate}`,
      );
    }
    return new LocalInstant(LocalInstant.parse(plainDate));
  }

  /** @internal Only used for tests. */
  static internalFromISO(instant: string, timeZone: string) {
    return new LocalInstant(
      LocalInstant.parse(instant).setZone(timeZone) as DateTime<true>,
    );
  }

  /** @internal */
  private static parse(iso: string): DateTime<true> {
    const dateTime = DateTime.fromISO(iso, { zone: "local" });
    if (!dateTime.isValid) {
      throw new Error(`"${iso}" is not a valid ISO8601 string`);
    }
    return dateTime;
  }
}

namespace LocalInstant {
  export interface DateUnits {
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

  export type TimeUnit =
    | "year"
    | "quarter"
    | "month"
    | "week"
    | "day"
    | "hour"
    | "minute"
    | "second"
    | "millisecond";

  export interface Duration {
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

export default LocalInstant;
