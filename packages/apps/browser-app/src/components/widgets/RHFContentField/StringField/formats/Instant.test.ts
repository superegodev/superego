import { describe, expect, it } from "vitest";
import { fromSegments, type Segments, toSegments } from "./Instant.js";

describe("fromSegments(toSegments(instant)) === instant", () => {
  const testCases: string[] = [
    // Empty.
    "",

    // Date only.
    "2026-01-12",
    "1999-12-31",
    "2000-01-01",

    // Time only.
    "22:22:22",
    "00:00:00",
    "23:59:59",
    "12:30:45",

    // Milliseconds only.
    "222",
    "0",
    "1",
    "999",
    "123456789",

    // Time + milliseconds.
    "22:22:22.222",
    "00:00:00.0",
    "23:59:59.999",
    "12:30:45.123456",

    // Date + time.
    "2026-01-12T22:22:22",
    "1999-12-31T23:59:59",
    "2000-01-01T00:00:00",

    // Date + time + milliseconds.
    "2026-01-12T22:22:22.222",
    "1999-12-31T23:59:59.999",
    "2000-01-01T00:00:00.0",
    "2026-01-12T12:30:45.123456789",

    // Milliseconds + offset.
    "222Z",
    "0Z",
    "999+05:30",
    "123-08:00",

    // Time + offset.
    "22:22:22Z",
    "00:00:00+00:00",
    "23:59:59-12:00",
    "12:30:45+14:00",

    // Time + milliseconds + offset.
    "22:22:22.222Z",
    "00:00:00.0+00:00",
    "23:59:59.999-05:00",
    "12:30:45.123+05:30",

    // Date + time + offset.
    "2026-01-12T22:22:22Z",
    "1999-12-31T23:59:59+00:00",
    "2000-01-01T00:00:00-08:00",

    // Full instant (date + time + milliseconds + offset).
    "2026-01-12T22:22:22.222Z",
    "2026-01-12T22:22:22.222+00:00",
    "1999-12-31T23:59:59.999-12:00",
    "2000-01-01T00:00:00.0+14:00",
    "2026-06-15T12:30:45.123+05:30",
    "2026-06-15T12:30:45.123-05:30",

    // Edge case offsets.
    "2026-01-12T22:22:22.222+14:00",
    "2026-01-12T22:22:22.222-12:00",
    "2026-01-12T22:22:22.222+05:30",
    "2026-01-12T22:22:22.222+05:45",
    "2026-01-12T22:22:22.222+09:30",

    // Single digit and long milliseconds.
    "2026-01-12T22:22:22.1Z",
    "2026-01-12T22:22:22.12Z",
    "2026-01-12T22:22:22.123456Z",
    "2026-01-12T22:22:22.123456789Z",

    // Date + offset (unusual but valid).
    "2026-01-12Z",
    "2026-01-12+00:00",
    "2026-01-12-08:00",
  ];
  testCases.forEach((instant) => {
    it(`case: ${instant || "(empty)"}`, () => {
      // Exercise + verify
      expect(instant).toEqual(fromSegments(toSegments(instant)));
    });
  });
});

describe("toSegments(fromSegments(segments)) === segments", () => {
  const testCases: Segments[] = [
    // All null.
    {
      date: null,
      time: null,
      milliseconds: null,
      offset: null,
    },

    // Date only.
    {
      date: "2026-01-12",
      time: null,
      milliseconds: null,
      offset: null,
    },
    {
      date: "1999-12-31",
      time: null,
      milliseconds: null,
      offset: null,
    },
    {
      date: "2000-01-01",
      time: null,
      milliseconds: null,
      offset: null,
    },

    // Time only.
    {
      date: null,
      time: "22:22:22",
      milliseconds: null,
      offset: null,
    },
    {
      date: null,
      time: "00:00:00",
      milliseconds: null,
      offset: null,
    },
    {
      date: null,
      time: "23:59:59",
      milliseconds: null,
      offset: null,
    },

    // Milliseconds only.
    {
      date: null,
      time: null,
      milliseconds: "222",
      offset: null,
    },
    {
      date: null,
      time: null,
      milliseconds: "0",
      offset: null,
    },
    {
      date: null,
      time: null,
      milliseconds: "999",
      offset: null,
    },
    {
      date: null,
      time: null,
      milliseconds: "123456789",
      offset: null,
    },

    // Offset only.
    {
      date: null,
      time: null,
      milliseconds: null,
      offset: "Z",
    },
    {
      date: null,
      time: null,
      milliseconds: null,
      offset: "+00:00",
    },
    {
      date: null,
      time: null,
      milliseconds: null,
      offset: "-08:00",
    },

    // Time + milliseconds.
    {
      date: null,
      time: "22:22:22",
      milliseconds: "222",
      offset: null,
    },
    {
      date: null,
      time: "00:00:00",
      milliseconds: "0",
      offset: null,
    },
    {
      date: null,
      time: "23:59:59",
      milliseconds: "999999",
      offset: null,
    },

    // Date + time.
    {
      date: "2026-01-12",
      time: "22:22:22",
      milliseconds: null,
      offset: null,
    },
    {
      date: "1999-12-31",
      time: "23:59:59",
      milliseconds: null,
      offset: null,
    },

    // Date + time + milliseconds.
    {
      date: "2026-01-12",
      time: "22:22:22",
      milliseconds: "222",
      offset: null,
    },
    {
      date: "2000-01-01",
      time: "00:00:00",
      milliseconds: "0",
      offset: null,
    },

    // Milliseconds + offset.
    {
      date: null,
      time: null,
      milliseconds: "222",
      offset: "Z",
    },
    {
      date: null,
      time: null,
      milliseconds: "999",
      offset: "+05:30",
    },

    // Time + offset.
    {
      date: null,
      time: "22:22:22",
      milliseconds: null,
      offset: "Z",
    },
    {
      date: null,
      time: "12:30:45",
      milliseconds: null,
      offset: "+14:00",
    },

    // Time + milliseconds + offset.
    {
      date: null,
      time: "22:22:22",
      milliseconds: "222",
      offset: "Z",
    },
    {
      date: null,
      time: "23:59:59",
      milliseconds: "999",
      offset: "-12:00",
    },

    // Date + offset (unusual but valid).
    {
      date: "2026-01-12",
      time: null,
      milliseconds: null,
      offset: "Z",
    },
    {
      date: "2026-01-12",
      time: null,
      milliseconds: null,
      offset: "+00:00",
    },

    // Date + time + offset.
    {
      date: "2026-01-12",
      time: "22:22:22",
      milliseconds: null,
      offset: "Z",
    },
    {
      date: "1999-12-31",
      time: "23:59:59",
      milliseconds: null,
      offset: "-05:00",
    },

    // Full instant (date + time + milliseconds + offset).
    {
      date: "2026-01-12",
      time: "22:22:22",
      milliseconds: "222",
      offset: "Z",
    },
    {
      date: "2026-01-12",
      time: "22:22:22",
      milliseconds: "222",
      offset: "+00:00",
    },
    {
      date: "1999-12-31",
      time: "23:59:59",
      milliseconds: "999",
      offset: "-12:00",
    },
    {
      date: "2000-01-01",
      time: "00:00:00",
      milliseconds: "0",
      offset: "+14:00",
    },

    // Edge case offsets.
    {
      date: "2026-01-12",
      time: "22:22:22",
      milliseconds: "222",
      offset: "+05:30",
    },
    {
      date: "2026-01-12",
      time: "22:22:22",
      milliseconds: "222",
      offset: "+05:45",
    },
    {
      date: "2026-01-12",
      time: "22:22:22",
      milliseconds: "222",
      offset: "+09:30",
    },

    // Variable millisecond lengths.
    {
      date: "2026-01-12",
      time: "22:22:22",
      milliseconds: "1",
      offset: "Z",
    },
    {
      date: "2026-01-12",
      time: "22:22:22",
      milliseconds: "12",
      offset: "Z",
    },
    {
      date: "2026-01-12",
      time: "22:22:22",
      milliseconds: "123456789",
      offset: "Z",
    },
  ];
  testCases.forEach((segments) => {
    it(`case: ${fromSegments(segments) || "(empty)"}`, () => {
      // Exercise + verify
      expect(segments).toEqual(toSegments(fromSegments(segments)));
    });
  });
});
