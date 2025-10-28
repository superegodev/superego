/////////////////////////////
// Superego built-in types //
/////////////////////////////

export type JsonObject = {
  __dataType: "JsonObject";
  [key: string]: any;
};

//////////////////
// Schema types //
//////////////////

/** Type of a calendar entry. */
export type Type = 
  /** An event, with a defined start time and a defined end time. */
  | "Event"
  /** A reminder, with a defined start time but no end time. */
  | "Reminder";

/**
 * An entry in my calendar.
 *
 * Note: This is the root type of this schema.
 */
export type CalendarEntry = {
  /** The type of the entry. */
  type: Type;
  /** Short title for the entry. 5 words max. */
  title: string;
  /**
   * When the event or reminder starts.
   *
   * #### Format `dev.superego:String.Instant`
   *
   * An exact point in time in the ISO 8601 format, **REQUIRED** to include milliseconds and a time offset.
   *
   * Format examples:
   * - "2006-08-24T19:39:09.000Z"
   * - "2006-08-24T22:39:09.068+03:00"
   */
  startTime: string;
  /**
   * When the event or reminder ends. Null for reminders.
   *
   * #### Format `dev.superego:String.Instant`
   *
   * An exact point in time in the ISO 8601 format, **REQUIRED** to include milliseconds and a time offset.
   *
   * Format examples:
   * - "2006-08-24T19:39:09.000Z"
   * - "2006-08-24T22:39:09.068+03:00"
   */
  endTime: string | null;
  /**
   * Misc notes.
   *
   * #### Format `dev.superego:JsonObject.TiptapRichText`
   *
   * A rich-text document as represented, in JSON, by the Tiptap rich-text editor.
   *
   * Format examples:
   * - {"__dataType":"JsonObject","type":"doc","content":[]}
   * - {"__dataType":"JsonObject","type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"Hello, World!"}]}]}
   */
  notes: JsonObject | null;
};
