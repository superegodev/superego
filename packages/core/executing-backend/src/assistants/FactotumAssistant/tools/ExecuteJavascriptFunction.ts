import {
  type Collection,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import { DateTime } from "luxon";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeResultError from "../../../makers/makeResultError.js";
import makeUnsuccessfulResult from "../../../makers/makeUnsuccessfulResult.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type JavascriptSandbox from "../../../requirements/JavascriptSandbox.js";
import type DocumentsList from "../../../usecases/documents/List.js";
import { toAssistantDocument } from "../utils/AssistantDocument.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.ExecuteJavascriptFunction {
    return toolCall.tool === ToolName.ExecuteJavascriptFunction;
  },

  async exec(
    toolCall: ToolCall.ExecuteJavascriptFunction,
    collections: Collection[],
    documentsList: DocumentsList,
    javascriptSandbox: JavascriptSandbox,
  ): Promise<ToolResult.ExecuteJavascriptFunction> {
    const { collectionId, javascriptFunction } = toolCall.input;

    const collection = collections.find(({ id }) => id === collectionId);
    if (!collection) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(
          makeResultError("CollectionNotFound", { collectionId }),
        ),
      };
    }

    const { data: documents, error: documentsListError } =
      await documentsList.exec(collectionId);
    if (documentsListError && documentsListError.name === "UnexpectedError") {
      throw new UnexpectedAssistantError(
        `Listing documents failed with UnexpectedError. Cause: ${documentsListError.details.cause}`,
      );
    }
    if (documentsListError) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(documentsListError),
      };
    }

    const assistantDocuments = documents.map((document) =>
      toAssistantDocument(
        collection.latestVersion.schema,
        document,
        DateTime.local().zoneName,
      ),
    );
    const result = await javascriptSandbox.executeSyncFunction(
      {
        source: "",
        compiled: javascriptFunction,
      },
      [assistantDocuments],
    );

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: result,
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.ExecuteJavascriptFunction,
      description: `
Runs a **synchronous**, **read-only** JS function over **all documents** in a
collection; returns a JSON-safe result (counts, aggregates, short lists, or
specific docs). Use this to **search** for a document (e.g., by weighed
criteria), **fetch** a specific item by \`id\`, or compute aggregates.

### Documents

\`\`\`ts
interface Document {
  id: string; // document ID
  versionId: string; // current document version ID
  content: any; // conforms to the collection schema
}
\`\`\`

### Rules

- No \`async\`, timers, or network.
- No \`import\` or \`require\`.
- Only use fields defined in the schema.
- Return **JSON-safe** values only (convert Dates to ISO strings if returning
  them).
- The function must be default-exported.

### Working with dates and times

Always use the global class \`LocalInstant\` helper for **all** date/time
parsing, math, and formatting. It runs in the user’s timezone and correctly
handles DST shifts, leap years, end-of-month rollovers, and locale formatting.
Prefer \`LocalInstant\` over native \`Date\` arithmetic.

\`\`\`ts
/**
 * Helper to work with dates and times in the user's current timezone and
 * locale. Instances are immutable. Calling methods returns new instances.
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
    instant: string,
  ): LocalInstant;

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
export default LocalInstant;
\`\`\`ts

#### Usage examples

To get the date "tomorrow at 9":
\`\`\`js
LocalInstant
  .now()
  .plus({ days: 1 })
  .set({ hour: 9 })
  .startOf("hour")
  .toISO();
\`\`\`

To get the date "next Friday at 11":
\`\`\`js
LocalInstant
  .now()
  .plus({ weeks: 1 })
  .set({ isoWeekday: 5, hour: 11 })
  .startOf("hour")
  .toISO();
\`\`\`

To compare a document string field with format \`dev.superego:String:Instant\`
(ISO8601 with millisecond precision and time offset):
\`\`\`js
const now = new Date();
const timestamp = new Date(document.timestamp);
const threeHoursAgo = LocalInstant
  .now()
  .minus({ hours: 3 })
  .toJSDate();
const isInThePast3Hours = timestamp <= now && timestamp >= threeHoursAgo;
\`\`\`
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collectionId: {
            type: "string",
          },
          javascriptFunction: {
            type: "string",
            description:
              "JavaScript source string implementing `export default function main(documents) { … }`",
          },
        },
        required: ["collectionId", "javascriptFunction"],
        additionalProperties: false,
      },
    };
  },
};
