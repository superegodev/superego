import { it } from "vitest";

export default function probabilisticIt(
  name: string,
  fn: () => void | Promise<void>,
  opts: { only?: boolean; todo?: boolean } = { only: false, todo: false },
) {
  const repeatTimes = Number.parseInt(
    import.meta.env["SUPEREGO_TESTS_REPEAT_TIMES"] ?? "1",
    10,
  );
  const passRate = Number.parseFloat(
    import.meta.env["SUPEREGO_TESTS_PASS_RATE"] ?? "0.9",
  );
  const testName = `${name} (x ${repeatTimes})`;
  const test = opts.only ? it.only : opts.todo ? it.todo : it;
  test(testName, { timeout: 30_000 * repeatTimes }, async () => {
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
  });
}

probabilisticIt.only = (name: string, fn: () => void | Promise<void>) =>
  probabilisticIt(name, fn, { only: true });
probabilisticIt.todo = (name: string, fn: () => void | Promise<void>) =>
  probabilisticIt(name, fn, { todo: true });
