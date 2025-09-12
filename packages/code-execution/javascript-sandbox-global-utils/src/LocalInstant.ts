import { DateTime, type WeekdayNumbers } from "luxon";

/**
 * Helper to work with dates and times in the user's current timezone and
 * locale. Instances are immutable. Calling methods returns new instances.
 */
class LocalInstant {
  private constructor(private dateTime: DateTime<true>) {}

  /**
   * Get a new LocalInstant set at the beginning of the given time unit.
   */
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

  /**
   * Get a new LocalInstant with set to the specified.
   */
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
   * Returns the ISO8601 representation of the instant, using the user's local
   * time offset.
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

  /**
   * Returns the instant formatted in a human-readable way, according to the
   * user's locale. Takes the same options of Intl.DateTimeFormat.
   */
  toFormat(options: LocalInstant.FormatOptions = {}): string {
    const intlOptions: Intl.DateTimeFormatOptions =
      "dateStyle" in options
        ? {
            dateStyle: options.dateStyle,
            timeStyle: options.timeStyle,
          }
        : "weekday" in options
          ? {
              weekday: options.weekday,
              era: options.era,
              year: options.year,
              month: options.month,
              day: options.day,
              hour: options.hour,
              minute: options.minute,
              second: options.second,
              fractionalSecondDigits: options.fractionalSecondDigits,
              timeZoneName: options.timeZoneName,
              dayPeriod: options.dayPeriod,
            }
          : {};
    return new Intl.DateTimeFormat(undefined, intlOptions).format(
      this.dateTime.toJSDate(),
    );
  }

  /** Creates a LocalInstant from an instant ISO8601 string. */
  static fromISO(
    /**
     * An ISO8601 string with millisecond precision and any valid time offset.
     */
    instant: string,
    /** @internal Only used for tests. */
    timeZone?: string,
  ) {
    const dateTime = LocalInstant.parse(instant);
    return new LocalInstant(
      (timeZone ? dateTime.setZone(timeZone) : dateTime) as DateTime<true>,
    );
  }

  /** Creates a LocalInstant for the current time. */
  static now() {
    return new LocalInstant(DateTime.now());
  }

  private static parse(instant: string): DateTime<true> {
    const dateTime = DateTime.fromISO(instant);
    if (!dateTime.isValid) {
      throw new Error(`Invalid instant "${instant}"`);
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

  export type FormatOptions =
    | {
        /** Date style shortcut */
        dateStyle?: "full" | "long" | "medium" | "short" | undefined;
        /** Time style shortcut */
        timeStyle?: "full" | "long" | "medium" | "short" | undefined;
      }
    | {
        /** Weekday text */
        weekday?: "long" | "short" | "narrow" | undefined;
        /** Era text */
        era?: "long" | "short" | "narrow" | undefined;
        /** Year representation */
        year?: "numeric" | "2-digit" | undefined;
        /** Month representation */
        month?: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined;
        /** Day of month */
        day?: "numeric" | "2-digit" | undefined;
        /** Hour/minute/second */
        hour?: "numeric" | "2-digit" | undefined;
        minute?: "numeric" | "2-digit" | undefined;
        second?: "numeric" | "2-digit" | undefined;
        /** Fractional seconds – spec allows 1–3 */
        fractionalSecondDigits?: 1 | 2 | 3 | undefined;
        /** Time zone name (extended set) */
        timeZoneName?:
          | "short"
          | "long"
          | "shortOffset"
          | "longOffset"
          | "shortGeneric"
          | "longGeneric"
          | undefined;
        /**
         * Day-period text like “in the morning”.
         * Typically meaningful with 12-hour cycles (h11/h12).
         */
        dayPeriod?: "narrow" | "short" | "long" | undefined;
      };
}

export default LocalInstant;
