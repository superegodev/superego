import type { ResultPromise } from "@superego/global-types";
import BaseUsecase from "./BaseUsecase.js";

/**
 * Base class for usecases that are only invoked internally — via `sub()` from
 * another usecase, or by the background-job runner — never via the public
 * `Backend` interface. These usecases skip the argument/result schemas
 * required on `Usecase` because they don't cross the public RPC boundary.
 */
export default abstract class InternalUsecase<
  Exec extends (...args: any[]) => ResultPromise<any, any> = (
    ...args: any[]
  ) => ResultPromise<any, any>,
> extends BaseUsecase<Exec> {}
