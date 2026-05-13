import type { ArgumentsNotValid } from "@superego/backend";
import type {
  Result,
  ResultError,
  ResultPromise,
} from "@superego/global-types";
import type * as v from "valibot";
import Usecase from "./Usecase.js";

/**
 * Strips `ArgumentsNotValid` from a Backend method's error union. The error
 * is added by `ExecutingBackend.makeUsecase` when input validation fails — the
 * usecase implementation itself never returns it. Subtracting it here keeps
 * the usecase's exec signature honest, so internal `sub()` callers don't see
 * a phantom error variant they could never receive.
 */
type StripArgumentsNotValid<Exec> = Exec extends (
  ...args: infer Args
) => Promise<Result<infer Data, infer Error>>
  ? (
      ...args: Args
    ) => Promise<
      Result<
        Data,
        Exclude<Error, ArgumentsNotValid> extends ResultError<string, any>
          ? Exclude<Error, ArgumentsNotValid>
          : never
      >
    >
  : Exec;

/**
 * Base class for usecases exposed via the public `Backend` interface. Each
 * subclass must declare an `argumentsSchema` and a `resultSchema` that the
 * `ExecutingBackend` uses to validate inputs and outputs at the RPC
 * boundary.
 */
export default abstract class BackendUsecase<
  Exec extends (...args: any[]) => ResultPromise<any, any> = (
    ...args: any[]
  ) => ResultPromise<any, any>,
> extends Usecase<StripArgumentsNotValid<Exec>> {
  abstract argumentsSchema: v.GenericSchema<
    unknown,
    Parameters<StripArgumentsNotValid<Exec>>
  >;
  abstract resultSchema: v.GenericSchema<
    unknown,
    Awaited<ReturnType<StripArgumentsNotValid<Exec>>>
  >;
}
