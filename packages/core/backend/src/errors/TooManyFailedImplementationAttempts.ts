import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";

const TooManyFailedImplementationAttemptsSchema = defineError(
  "TooManyFailedImplementationAttempts",
  v.object({ failedAttemptsCount: v.number() }),
);
export default TooManyFailedImplementationAttemptsSchema;
export type TooManyFailedImplementationAttempts = v.InferOutput<
  typeof TooManyFailedImplementationAttemptsSchema
>;
