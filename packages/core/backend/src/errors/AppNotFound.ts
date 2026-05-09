import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import AppIdSchema from "../ids/AppId.js";

const AppNotFoundSchema = defineError(
  "AppNotFound",
  v.object({ appId: AppIdSchema }),
);
export default AppNotFoundSchema;
export type AppNotFound = v.InferOutput<typeof AppNotFoundSchema>;
