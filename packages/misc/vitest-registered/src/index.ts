import { describe, type TestFunction, test } from "vitest";

export function registeredDescribe<GetDependencies>(
  name: string,
  fn: (
    getDependencies: GetDependencies,
    it: {
      (name: string, testFn: TestFunction): void;
      only(name: string, testFn: TestFunction): void;
    },
  ) => void,
) {
  return (getDependencies: GetDependencies, testsToSkip?: string[]) => {
    function it(name: string, testFn: TestFunction, only?: boolean) {
      test(
        name,
        { only: only, skip: testsToSkip?.includes(name) ?? false },
        testFn,
      );
    }
    it.only = (name: string, testFn: TestFunction) => it(name, testFn, true);
    describe(name, () => fn(getDependencies, it));
  };
}
