import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";

const UnexpectedErrorSchema = defineError(
  "UnexpectedError",
  v.object({ cause: v.any() }),
);
export default UnexpectedErrorSchema;
export type UnexpectedError = v.InferOutput<typeof UnexpectedErrorSchema>;
