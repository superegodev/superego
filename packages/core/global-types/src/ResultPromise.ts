import type Result from "./Result.js";
import type ResultError from "./ResultError.js";

type ResultPromise<Data, Error extends ResultError<any, any>> = Promise<
  Result<Data, Error>
>;
export default ResultPromise;
