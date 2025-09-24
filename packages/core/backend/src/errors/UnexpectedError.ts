import type { ResultError } from "@superego/global-types";

type UnexpectedError = ResultError<
  "UnexpectedError",
  {
    cause: any;
  }
>;
export default UnexpectedError;
