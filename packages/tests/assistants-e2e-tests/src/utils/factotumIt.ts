import { expect, it } from "vitest";
import type GetDependencies from "../GetDependencies.js";
import FactotumObject from "./FactotumObject.js";

const REPEAT_TIMES_ENV = "SUPEREGO_TESTS_REPEAT_TIMES";
const DEFAULT_REPEAT_TIMES = 1;
const DEFAULT_PASS_RATE = 0.8;

interface Options {
  deps: GetDependencies;
  only?: boolean;
  skip?: boolean;
  todo?: boolean;
  passRate?: number;
}

type FactotumTestFunction = (factotum: FactotumObject) => Promise<void>;

export default function factotumIt(
  name: string,
  options: Options,
  testFunction: FactotumTestFunction,
) {
  const repeatTimes =
    Number.parseInt(import.meta.env[REPEAT_TIMES_ENV], 10) ||
    DEFAULT_REPEAT_TIMES;
  const passRate = options.passRate ?? DEFAULT_PASS_RATE;

  it(
    repeatTimes === 1 ? name : `${name} (x ${repeatTimes})`,
    { only: options.only, skip: options.skip, todo: options.todo },
    async ({ annotate }) => {
      let failedCount = 0;
      for (let i = 0; i < repeatTimes; i++) {
        let factotum: FactotumObject | null = null;
        try {
          const { backend, booleanOracle } = options.deps();
          factotum = new FactotumObject(backend, booleanOracle);
          await testFunction(factotum);
        } catch (error) {
          if (factotum) {
            await annotate(
              JSON.stringify(factotum.getConversation()),
              `Repeat ${i} - Conversation log`,
            );
          }
          if (repeatTimes === 1) {
            throw error;
          }
          await annotate(String(error), `Repeat ${i} - Error`);
          failedCount += 1;
        }
      }
      const passedCount = repeatTimes - failedCount;
      const actualRate =
        Math.round((passedCount / repeatTimes + Number.EPSILON) * 100) / 100;
      await annotate(`Pass rate = ${actualRate}`);

      expect(
        actualRate,
        `Insufficient pass rate. ${passedCount} passed out of ${repeatTimes} attempts; rate = ${actualRate}; desired rate = ${passRate}.`,
      ).toBeGreaterThanOrEqual(passRate);
    },
  );
}
