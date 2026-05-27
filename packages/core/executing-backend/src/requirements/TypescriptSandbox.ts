import type { TypescriptModule } from "@superego/backend";
import type { ResultError, ResultPromise } from "@superego/global-types";

namespace TypescriptSandbox {
  export type ExecutingFunctionFailed = ResultError<
    "ExecutingFunctionFailed",
    {
      message: string;
      name?: string | undefined;
      stack?: string | undefined;
    }
  >;
}

interface TypescriptSandbox {
  /**
   * Returns whether the default export of the supplied TypescriptModule is a
   * function.
   */
  moduleDefaultExportsFunction(
    typescriptModule: TypescriptModule,
  ): Promise<boolean>;
  /**
   * Executes the default-exported function of the supplied TypescriptModule
   * with the supplied arguments. The function MUST synchronously return a
   * value. To avoid unexpected results for the user, the value SHOULD be
   * serializable to JSON and be invariant to the JSON serialization process.
   * That is, `JSON.parse(JSON.stringify(value))` should deep-equal `value`.
   * Examples of values that are not JSON-invariant: `Date` objects, functions.
   */
  executeSyncFunction(
    /** TypeScript module that default-exports a function. */
    typescriptModule: TypescriptModule,
    /**
     * Arguments to call the function with. They MUST be JSON-serializable and
     * JSON-invariant.
     */
    args: any[],
  ): ResultPromise<any, TypescriptSandbox.ExecutingFunctionFailed>;
}

export default TypescriptSandbox;
