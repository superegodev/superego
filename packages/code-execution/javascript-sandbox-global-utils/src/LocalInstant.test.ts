import { describe, expect, it } from "vitest";
import LocalInstant from "./LocalInstant.js";

describe("creating LocalInstants from strings", () => {
  describe("fromISO", () => {
    it("throws on non-valid ISO strings", () => {
      // Exercise
      const troublemaker = () => LocalInstant.fromISO("not an instant");

      // Verify
      expect(troublemaker).toThrowError(
        '"not an instant" is not a valid ISO8601 string',
      );
    });

    it("correctly parses valid ISO strings", () => {
      // Exercise
      const nowISO = new Date().toISOString();
      const nowLocalInstant = LocalInstant.fromISO(nowISO);

      // Verify
      expect(Date.parse(nowLocalInstant.toISO())).toEqual(Date.parse(nowISO));
    });

    it("when not specified in the input string, sets the time offset to the user's timezone", () => {
      // Exercise
      const isoWithoutTimeOffset = new Date().toISOString().slice(0, -1);
      const localInstant = LocalInstant.fromISO(isoWithoutTimeOffset);

      // Verify
      expect(localInstant.toISO().startsWith(isoWithoutTimeOffset)).toEqual(
        true,
      );
    });
  });

  describe("fromInstant", () => {
    it("throws on non-valid Instant strings", () => {
      // Exercise
      const troublemaker = () =>
        LocalInstant.fromInstant("1970-01-01T00:00:00.000");

      // Verify
      expect(troublemaker).toThrowError(
        '"1970-01-01T00:00:00.000" is not a valid dev.superego:String.Instant',
      );
    });

    describe("correctly parses valid Instants", () => {
      it("case: Z time offset", () => {
        // Exercise
        const zInstant = "1970-01-01T00:00:00.000Z";
        const localInstant = LocalInstant.fromInstant(zInstant);

        // Verify
        expect(Date.parse(localInstant.toISO())).toEqual(Date.parse(zInstant));
      });

      it("case: user's time offset", () => {
        // Exercise
        const nonZInstant = "1970-01-01T00:00:00.000+02:00";
        const localInstant = LocalInstant.fromInstant(nonZInstant);

        // Verify
        expect(Date.parse(localInstant.toISO())).toEqual(
          Date.parse(nonZInstant),
        );
      });
    });
  });

  describe("fromPlainDate", () => {
    it("throws on non-valid PlainDate strings", () => {
      // Exercise
      const troublemaker = () =>
        LocalInstant.fromPlainDate("1970-01-01T00:00:00.000Z");

      // Verify
      expect(troublemaker).toThrowError(
        '"1970-01-01T00:00:00.000Z" is not a valid dev.superego:String.PlainDate',
      );
    });

    it("correctly parses valid PlainDates", () => {
      // Exercise
      const plainDate = "1970-01-01";
      const localInstant = LocalInstant.fromPlainDate(plainDate);

      // Verify
      expect(
        localInstant.toISO().startsWith("1970-01-01T00:00:00.000"),
      ).toEqual(true);
    });
  });
});

describe("allows to express dates in the past and in the future", () => {
  interface TestCase {
    name: string;
    currentLocalInstant: LocalInstant;
    targetDate: Date;
  }
  const testCases: TestCase[] = [
    // Future
    {
      name: "tomorrow at 9, without DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-09-12T14:48:00.000+03:00",
        "Europe/Vilnius",
      )
        .plus({ days: 1 })
        .set({ hour: 9 })
        .startOf("hour"),
      targetDate: new Date("2025-09-13T09:00:00.000+03:00"),
    },
    {
      name: "tomorrow at 9, with DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-10-25T14:48:00.000+03:00",
        "Europe/Vilnius",
      )
        .plus({ days: 1 })
        .set({ hour: 9 })
        .startOf("hour"),
      targetDate: new Date("2025-10-26T09:00:00.000+02:00"),
    },
    {
      name: "next Saturday at 9, without DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-09-12T14:48:00.000+03:00",
        "Europe/Vilnius",
      )
        .plus({ weeks: 1 })
        .set({ isoWeekday: 6, hour: 9 })
        .startOf("hour"),
      targetDate: new Date("2025-09-20T09:00:00.000+03:00"),
    },
    {
      name: "next Saturday at 9, with DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-10-24T14:48:00.000+03:00",
        "Europe/Vilnius",
      )
        .plus({ weeks: 1 })
        .set({ isoWeekday: 6, hour: 9 })
        .startOf("hour"),
      targetDate: new Date("2025-11-01T09:00:00.000+02:00"),
    },
    {
      name: "start of next week, without DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-09-12T14:48:00.000+03:00",
        "Europe/Vilnius",
      )
        .plus({ weeks: 1 })
        .startOf("week"),
      targetDate: new Date("2025-09-15T00:00:00.000+03:00"),
    },
    {
      name: "start of next week, with DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-10-24T14:48:00.000+03:00",
        "Europe/Vilnius",
      )
        .plus({ weeks: 1 })
        .startOf("week"),
      targetDate: new Date("2025-10-27T00:00:00.000+02:00"),
    },
    {
      name: "end of next week, without DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-09-12T14:48:00.000+03:00",
        "Europe/Vilnius",
      )
        .plus({ weeks: 1 })
        .endOf("week"),
      targetDate: new Date("2025-09-21T23:59:59.999+03:00"),
    },
    {
      name: "end of next week, with DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-10-24T14:48:00.000+03:00",
        "Europe/Vilnius",
      )
        .plus({ weeks: 1 })
        .endOf("week"),
      targetDate: new Date("2025-11-02T23:59:59.999+02:00"),
    },
    // Past
    {
      name: "yesterday at 9, without DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-09-12T14:48:00.000+03:00",
        "Europe/Vilnius",
      )
        .minus({ days: 1 })
        .set({ hour: 9 })
        .startOf("hour"),
      targetDate: new Date("2025-09-11T09:00:00.000+03:00"),
    },
    {
      name: "yesterday at 9, with DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-10-26T14:48:00.000+02:00",
        "Europe/Vilnius",
      )
        .minus({ days: 1 })
        .set({ hour: 9 })
        .startOf("hour"),
      targetDate: new Date("2025-10-25T09:00:00.000+03:00"),
    },
    {
      name: "previous Saturday at 9, without DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-09-12T14:48:00.000+03:00",
        "Europe/Vilnius",
      )
        .minus({ weeks: 1 })
        .set({ isoWeekday: 6, hour: 9 })
        .startOf("hour"),
      targetDate: new Date("2025-09-06T09:00:00.000+03:00"),
    },
    {
      name: "previous Saturday at 9, with DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-10-30T14:48:00.000+02:00",
        "Europe/Vilnius",
      )
        .minus({ weeks: 1 })
        .set({ isoWeekday: 6, hour: 9 })
        .startOf("hour"),
      targetDate: new Date("2025-10-25T09:00:00.000+03:00"),
    },
    {
      name: "start of previous week, without DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-09-12T14:48:00.000+03:00",
        "Europe/Vilnius",
      )
        .minus({ weeks: 1 })
        .startOf("week"),
      targetDate: new Date("2025-09-01T00:00:00.000+03:00"),
    },
    {
      name: "start of previous week, with DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-10-27T14:48:00.000+02:00",
        "Europe/Vilnius",
      )
        .minus({ weeks: 1 })
        .startOf("week"),
      targetDate: new Date("2025-10-20T00:00:00.000+03:00"),
    },
    {
      name: "end of previous week, without DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-09-12T14:48:00.000+03:00",
        "Europe/Vilnius",
      )
        .minus({ weeks: 1 })
        .endOf("week"),
      targetDate: new Date("2025-09-07T23:59:59.999+03:00"),
    },
    {
      name: "end of previous week, with DST changes",
      currentLocalInstant: LocalInstant.internalFromISO(
        "2025-10-26T14:48:00.000+02:00",
        "Europe/Vilnius",
      )
        .minus({ weeks: 1 })
        .endOf("week"),
      targetDate: new Date("2025-10-19T23:59:59.999+03:00"),
    },
  ];

  testCases.forEach(({ name, currentLocalInstant, targetDate }) => {
    it(`case: ${name}`, () => {
      expect(currentLocalInstant.toISO()).toEqual(
        LocalInstant.internalFromISO(
          targetDate.toISOString(),
          "Europe/Vilnius",
        ).toISO(),
      );
      expect(currentLocalInstant.toJSDate()).toEqual(targetDate);
    });
  });
});

describe("allows comparisons", () => {
  it("case: >", () => {
    // Exercise
    const localInstant1 = LocalInstant.fromISO("2025-09-22T00:00:00.000+03:00");
    const localInstant2 = LocalInstant.fromISO("2025-09-23T00:00:00.000+03:00");

    // Verify
    expect(localInstant2 > localInstant1).toEqual(true);
  });

  it("case: >=", () => {
    // Exercise
    const localInstant1 = LocalInstant.fromISO("2025-09-22T00:00:00.000+03:00");
    const localInstant2 = LocalInstant.fromISO("2025-09-22T00:00:00.000+03:00");

    // Verify
    expect(localInstant2 >= localInstant1).toEqual(true);
  });

  it("case: <", () => {
    // Exercise
    const localInstant1 = LocalInstant.fromISO("2025-09-23T00:00:00.000+03:00");
    const localInstant2 = LocalInstant.fromISO("2025-09-22T00:00:00.000+03:00");

    // Verify
    expect(localInstant2 < localInstant1).toEqual(true);
  });

  it("case: <=", () => {
    // Exercise
    const localInstant1 = LocalInstant.fromISO("2025-09-22T00:00:00.000+03:00");
    const localInstant2 = LocalInstant.fromISO("2025-09-22T00:00:00.000+03:00");

    // Verify
    expect(localInstant2 <= localInstant1).toEqual(true);
  });
});

it("stringifies as ISO", () => {
  // Exercise
  const localInstant = LocalInstant.fromISO("2025-09-22T00:00:00.000+03:00");

  // Verify
  expect(String(localInstant)).toEqual(localInstant.toISO());
});
