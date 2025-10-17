import type Result from "./Result.js";
import type ResultError from "./ResultError.js";

type ResultPromise<Data, Error extends ResultError<string, any>> = Promise<
  Result<Data, Error>
>;
export default ResultPromise;
