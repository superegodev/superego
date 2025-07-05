import { fc, it as fit } from "@fast-check/vitest";
import { expect } from "vitest";
import classnames from "./classnames.js";

fit.prop([
  fc.array(fc.oneof(fc.string(), fc.constant(false)), {
    minLength: 0,
    maxLength: 100,
  }),
])("joins all non-false class names", (classNames) => {
  // Exercise
  const joinedClassName = classnames(...classNames);

  // Verify
  for (const className of classNames) {
    if (className) {
      expect(joinedClassName.includes(className)).toBe(true);
    }
  }
});
