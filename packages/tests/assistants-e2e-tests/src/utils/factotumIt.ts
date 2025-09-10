import { it, vi } from "vitest";
import type Dependencies from "../Dependencies.js";
import FactotumObject from "./FactotumObject.js";

const REPEAT_TIMES_ENV = "SUPEREGO_TESTS_REPEAT_TIMES";
const DEFAULT_REPEAT_TIMES = 1;
const DEFAULT_PASS_RATE = 0.9;

interface Options {
  deps: () => Promise<Dependencies>;
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
    `${name} (x ${repeatTimes})`,
    { only: options.only, skip: options.skip, todo: options.todo },
    async ({ annotate, task }) => {
      console.log(task.timeout);
      vi.setConfig({ testTimeout: task.timeout * repeatTimes });
      const { backend, booleanOracle } = await options.deps();
      const factotum = new FactotumObject(backend, booleanOracle);

      const errors: any[] = [];
      for (let i = 0; i < repeatTimes; i++) {
        try {
          await testFunction(factotum);
        } catch (error) {
          await annotate(String(error), `Repeat ${0} - Error`);
          await annotate(
            JSON.stringify(factotum.getConversation()),
            `Repeat ${0} - Conversation log`,
          );
          errors.push(error);
        }
      }
      const passedCount = repeatTimes - errors.length;
      const actualRate =
        Math.round((passedCount / repeatTimes + Number.EPSILON) * 100) / 100;

      if (actualRate < passRate) {
        await annotate(
          `Insufficient pass rate. ${passedCount} passed out of ${repeatTimes} attempts; rate = ${actualRate}; desired rate = ${passRate}.`,
        );
        throw errors[0];
      }
    },
  );
}
