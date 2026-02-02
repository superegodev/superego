import type { ResultError } from "@superego/global-types";
import type BackgroundJobId from "../ids/BackgroundJobId.js";

type BackgroundJobNotFound = ResultError<
  "BackgroundJobNotFound",
  {
    backgroundJobId: BackgroundJobId;
  }
>;
export default BackgroundJobNotFound;
