import { it } from "vitest";

interface Options {
  passRate?: number;
  only?: boolean;
  todo?: boolean;
}

type TestFunction = () => Promise<void>;

export default function probabilisticIt(name: string, fn: TestFunction): void;
export default function probabilisticIt(
  name: string,
  options: Options,
  fn: TestFunction,
): void;
export default function probabilisticIt(
  name: string,
  fnOrOptions: TestFunction | Options,
  fnOrUndefined?: TestFunction | undefined,
): void {
  const fn = (
    typeof fnOrOptions === "function" ? fnOrOptions : fnOrUndefined
  ) as TestFunction;
  const options =
    typeof fnOrOptions === "object"
      ? fnOrOptions
      : { only: false, todo: false };

  const repeatTimes = Number.parseInt(
    import.meta.env["SUPEREGO_TESTS_REPEAT_TIMES"] ?? "1",
    10,
  );
  const passRate =
    options.passRate ??
    Number.parseFloat(import.meta.env["SUPEREGO_TESTS_PASS_RATE"] ?? "0.9");
  const testName = `${name} (x ${repeatTimes})`;
  it(
    testName,
    { timeout: 30_000 * repeatTimes, only: options.only, todo: options.todo },
    async () => {
      const errors: any[] = [];
      for (let i = 0; i < repeatTimes; i++) {
        try {
          await fn();
        } catch (error) {
          errors.push(error);
        }
      }
      const passedCount = repeatTimes - errors.length;
      const actualRate =
        Math.round((passedCount / repeatTimes + Number.EPSILON) * 100) / 100;
      if (actualRate < passRate) {
        console.error(`${testName}`);
        console.error(
          `Insufficient pass rate. ${passedCount} passed out of ${repeatTimes} attempts; rate = ${actualRate}; desired rate = ${passRate}.`,
        );
        errors.forEach((error) => console.error(error));
        throw errors[0];
      }
    },
  );
}
