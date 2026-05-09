import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import BackgroundJobIdSchema from "../ids/BackgroundJobId.js";

const BackgroundJobNotFoundSchema = defineError(
  "BackgroundJobNotFound",
  v.object({ backgroundJobId: BackgroundJobIdSchema }),
);
export default BackgroundJobNotFoundSchema;
export type BackgroundJobNotFound = v.InferOutput<
  typeof BackgroundJobNotFoundSchema
>;
