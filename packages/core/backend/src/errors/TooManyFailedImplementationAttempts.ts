import type { ResultError } from "@superego/global-types";

type TooManyFailedImplementationAttempts = ResultError<
  "TooManyFailedImplementationAttempts",
  {
    failedAttemptsCount: number;
  }
>;
export default TooManyFailedImplementationAttempts;
