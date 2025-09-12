import type {
  ExecutingJavascriptFunctionFailed,
  TypescriptModule,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";

export default interface JavascriptSandbox {
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
  ): ResultPromise<any, ExecutingJavascriptFunctionFailed>;
}
