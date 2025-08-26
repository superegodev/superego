import DataType from "../DataType.js";
import FormatId from "../formats/FormatId.js";
import type Schema from "../Schema.js";

export default {
  types: {
    SleepStageSummary: {
      description: {
        en: "Summary of time spent in different sleep stages in minutes.",
      },
      dataType: DataType.Struct,
      properties: {
        deep: {
          description: { en: "Minutes in deep sleep." },
          dataType: DataType.Number,
        },
        light: {
          description: { en: "Minutes in light sleep." },
          dataType: DataType.Number,
        },
        rem: {
          description: { en: "Minutes in REM sleep." },
          dataType: DataType.Number,
        },
        awake: {
          description: { en: "Minutes awake during the sleep period." },
          dataType: DataType.Number,
        },
      },
    },
    SleepInterruption: {
      description: { en: "Details of a sleep interruption." },
      dataType: DataType.Struct,
      properties: {
        time: {
          description: { en: "Timestamp of the interruption." },
          dataType: DataType.String,
          format: FormatId.String.Instant,
        },
        durationSeconds: {
          description: { en: "Duration of the interruption in seconds." },
          dataType: DataType.Number,
        },
        reason: {
          description: { en: "User-reported reason for interruption." },
          dataType: DataType.String,
        },
      },
      nullableProperties: ["reason"],
    },
    SleepSession: {
      description: { en: "Represents a single sleep session." },
      dataType: DataType.Struct,
      properties: {
        startTime: {
          dataType: DataType.String,
          format: FormatId.String.Instant,
        },
        endTime: {
          dataType: DataType.String,
          format: FormatId.String.Instant,
        },
        totalDurationMinutes: {
          description: { en: "Total duration in bed in minutes." },
          dataType: DataType.Number,
        },
        actualSleepMinutes: {
          description: {
            en: "Calculated actual sleep duration in minutes.",
          },
          dataType: DataType.Number,
        },
        qualityScore: {
          description: { en: "Sleep quality score (e.g., 0-100)." },
          dataType: DataType.Number,
          format: FormatId.Number.Integer,
        },
        sleepStages: { dataType: null, ref: "SleepStageSummary" },
        interruptions: {
          dataType: DataType.List,
          items: { dataType: null, ref: "SleepInterruption" },
        },
        dreamRecorded: {
          description: {
            en: "Whether a dream was recorded for this session.",
          },
          dataType: DataType.BooleanLiteral,
          value: false,
        },
        dreamNotes: {
          description: { en: "Notes about any dreams." },
          dataType: DataType.String,
        },
      },
      nullableProperties: [
        "actualSleepMinutes",
        "qualityScore",
        "sleepStages",
        "interruptions",
        "dreamNotes",
      ],
    },
  },
  rootType: "SleepSession",
} satisfies Schema;
