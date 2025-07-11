import * as v from "valibot";
import DataType from "../DataType.js";
import type Format from "../Format.js";
import translate from "../utils/translate.js";
import FormatId from "./FormatId.js";

export default [
  {
    dataType: DataType.String,
    id: FormatId.String.PlainDate,
    name: {
      en: "Plain Date",
    },
    description: {
      en: "A calendar date in the ISO8601 format, not associated with a particular time or time zone.",
    },
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
      v.check(
        (input) => {
          try {
            return (
              new Date(`${input}T00:00:00.000Z`).toISOString().split("T")[0] ===
              input
            );
          } catch {
            return false;
          }
        },
        ({ received, lang }) =>
          translate(lang, {
            en: `Invalid plain date: Received ${received}`,
          }),
      ),
    ),
  },

  {
    dataType: DataType.String,
    id: FormatId.String.PlainTime,
    name: {
      en: "Plain Time",
    },
    description: {
      en: "A wall-clock time in the ISO8601 format, with at most millisecond precision, not associated with a particular date or time zone.",
    },
    validExamples: ["T19:39:09", "T19:39:09.068", "T19:39:09.000"],
    invalidExamples: [
      "19:39:09",
      "T19:39:09.068346205",
      "T25:00:00",
      "T19:39:09.068346205Z",
      "2023-02-29",
      "not a plain time",
      "2024-09-16T19:39:09.068346205",
    ],
    valibotSchema: v.pipe(
      v.string(),
      v.check(
        (input) =>
          /^T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(\.\d{1,3})?$/.test(input),
        ({ received, lang }) =>
          translate(lang, {
            en: `Invalid plain time: Received ${received}`,
          }),
      ),
    ),
  },

  {
    dataType: DataType.String,
    id: FormatId.String.Instant,
    name: {
      en: "Instant",
    },
    description: {
      en: 'An exact point in time in the ISO8601 format, in "Zulu time", with millisecond precision.',
    },
    validExamples: ["2006-08-24T19:39:09.000Z", "2006-08-24T19:39:09.068Z"],
    invalidExamples: [
      "not an instant",
      "2006-08-24T19:39:09Z",
      "2006-08-24T19:39:09.068346205Z",
      "2006-08-24T19:39:09",
      "2006-08-24T19:39:09.000",
    ],
    valibotSchema: v.pipe(
      v.string(),
      v.check(
        (input) => {
          try {
            return new Date(input).toISOString() === input;
          } catch {
            return false;
          }
        },
        ({ received, lang }) =>
          translate(lang, {
            en: `Invalid instant: Received ${received}`,
          }),
      ),
    ),
  },
] satisfies Format<DataType.String>[];
