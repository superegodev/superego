import { fc, it as fit } from "@fast-check/vitest";
import { expect } from "vitest";
import groupBy from "./groupBy.js";

fit.prop([
  fc.array(
    fc.record({
      id: fc.string(),
      category0: fc.option(fc.constantFrom(..."01")),
      category1: fc.option(fc.constantFrom(..."012")),
      category2: fc.option(fc.constantFrom(..."012345")),
    }),
    { minLength: 0, maxLength: 1000 },
  ),
  fc.constantFrom("category0", "category1", "category2"),
])(
  "groups elements by the supplied property, stringified",
  (items, propertyName) => {
    // Exercise
    const itemsByProperty = groupBy(items, (item) =>
      String(item[propertyName]),
    );

    // Verify
    expect(Object.values(itemsByProperty).flat().length).toBe(items.length);
    for (const [groupName, group] of Object.entries(itemsByProperty)) {
      expect(
        group.every((item) => String(item[propertyName]) === groupName),
      ).toBe(true);
    }
  },
);
