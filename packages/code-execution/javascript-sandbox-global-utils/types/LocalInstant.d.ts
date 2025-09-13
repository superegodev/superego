/**
 * Helper to work with dates and times in the user's current timezone and
 * locale. Instances are immutable. Calling methods returns new instances.
 * This class is defined in the global scope. Don't import or require it.
 */
declare class LocalInstant {
    private constructor();
    /**
     * Get a new LocalInstant set at the beginning of the given time unit.
     */
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
    /**
     * Get a new LocalInstant with set to the specified.
     */
    set(dateUnits: LocalInstant.DateUnits): LocalInstant;
    /**
     * Returns the ISO8601 representation of the instant, using the user's local
     * time offset.
     */
    toISO(): string;
    toJSDate(): Date;
    /**
     * Returns the instant formatted in a human-readable way, according to the
     * user's locale.
     */
    toFormat(options?: LocalInstant.FormatOptions): string;
    /** Creates a LocalInstant from an instant ISO8601 string. */
    static fromISO(
    /**
     * An ISO8601 string with millisecond precision and any valid time offset.
     */
    instant: string): LocalInstant;
    /** Creates a LocalInstant for the current time. */
    static now(): LocalInstant;
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
    type TimeUnit = "year" | "quarter" | "month" | "week" | "day" | "hour" | "minute" | "second" | "millisecond";
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
    type FormatOptions = {
        /** Date style shortcut */
        dateStyle?: "full" | "long" | "medium" | "short" | undefined;
        /** Time style shortcut */
        timeStyle?: "full" | "long" | "medium" | "short" | undefined;
    } | {
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
        timeZoneName?: "short" | "long" | "shortOffset" | "longOffset" | "shortGeneric" | "longGeneric" | undefined;
        /**
         * Day-period text like “in the morning”.
         * Typically meaningful with 12-hour cycles (h11/h12).
         */
        dayPeriod?: "narrow" | "short" | "long" | undefined;
    };
}
