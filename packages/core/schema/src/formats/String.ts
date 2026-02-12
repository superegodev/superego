import * as v from "valibot";
import DataType from "../DataType.js";
import type Format from "../Format.js";
import {
  isValidInstant,
  isValidPlainDate,
  isValidPlainTime,
} from "../utils/dateTimeValidators.js";
import translate from "../utils/translate.js";
import FormatId from "./FormatId.js";

export default [
  {
    dataType: DataType.String,
    id: FormatId.String.PlainDate,
    name: "Plain Date",
    description:
      "A calendar date in the ISO 8601 format, with no time and no UTC offset.",
    validExamples: [
      "2006-08-24",
      "2024-02-29",
      "-000924-01-01",
      "0924-01-01",
      "+010924-01-01",
    ],
    invalidExamples: [
      "not a plain date",
      "2006-09-31",
      "2006-02-29",
      "2006-08-24T",
      "2006-08-24T19:00Z",
      "2006-08-24T19:00:00.000",
      "19:39:09.068346205",
    ],
    valibotSchema: v.pipe(
      v.string(),
      v.check(isValidPlainDate, ({ received, lang }) =>
        translate(lang, {
          en: `Invalid plain date: Received ${received}. Expected format: YYYY-MM-DD (no time, no offset; Gregorian-valid).`,
        }),
      ),
    ),
  },

  {
    dataType: DataType.String,
    id: FormatId.String.PlainTime,
    name: "Plain Time",
    description:
      "A wall-clock time with no date and no UTC offset. Format: [T]HH[:mm[:ss[.sss]]], where hours are 00–23; minutes and seconds are optional; fractional seconds are optional up to 3 digits.",
    validExamples: [
      "T19:39:09.068",
      "19:39:09.068",
      "T19:39:09",
      "19:39:09",
      "T19:39",
      "19:39",
      "T19",
      "19",
      "T19:39:09.000",
      "19:39:09.000",
    ],
    invalidExamples: [
      "T19:39:09.068346205",
      "T25:00:00",
      "T19:39:09.068346205Z",
      "2023-02-29",
      "not a plain time",
      "2024-09-16T19:39:09.068346205",
    ],
    valibotSchema: v.pipe(
      v.string(),
      v.check(isValidPlainTime, ({ received, lang }) =>
        translate(lang, {
          en: `Invalid plain time: Received ${received}. Expected format: [T]HH[:mm[:ss[.sss]]] (no date, no offset; up to 3 fractional digits).`,
        }),
      ),
    ),
  },

  {
    dataType: DataType.String,
    id: FormatId.String.Instant,
    name: "Instant",
    description:
      "An exact point in time in the ISO 8601 format, **REQUIRED** to include milliseconds and a time offset.",
    validExamples: [
      "2006-08-24T19:39:09.000Z",
      "2006-08-24T22:39:09.068+03:00",
      "2006-08-24T22:39:09.068+0300",
    ],
    invalidExamples: [
      "not an instant",
      // No millisecond precision.
      "2006-08-24T19:39:09Z",
      "2006-08-24T22:39:09+03:00",
      "2006-08-24T19:39:09.068346205Z",
      // No time offset.
      "2006-08-24T19:39:09",
      "2006-08-24T19:39:09.000",
      // Exception: should be valid, but JavaScript's Date implementation
      // doesn't support this, so better to avoid it.
      "2006-08-24T22:39:09.068+03",
    ],
    valibotSchema: v.pipe(
      v.string(),
      v.check(isValidInstant, ({ received, lang }) =>
        translate(lang, { en: `Invalid instant: Received ${received}.` }),
      ),
    ),
  },

  {
    dataType: DataType.String,
    id: FormatId.String.Markdown,
    name: "Markdown",
    description: "A Markdown-formatted string.",
    validExamples: [
      "# Hello World",
      "Some **bold** and *italic* text.",
      "- item 1\n- item 2\n- item 3",
    ],
    invalidExamples: [],
    valibotSchema: v.string(),
  },
] satisfies Format<DataType.String>[];
