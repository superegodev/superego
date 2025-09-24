import type ResultError from "./ResultError.js";

type Result<Data, Error extends ResultError<any, any>> =
  | { success: true; data: Data; error: null }
  | { success: false; data: null; error: Error };
export default Result;
