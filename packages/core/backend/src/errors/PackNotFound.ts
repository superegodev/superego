import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import PackIdSchema from "../ids/PackId.js";

const PackNotFoundSchema = defineError(
  "PackNotFound",
  v.object({ packId: PackIdSchema }),
);
export default PackNotFoundSchema;
export type PackNotFound = v.InferOutput<typeof PackNotFoundSchema>;
