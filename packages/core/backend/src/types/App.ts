import * as v from "valibot";
import { AppTypeSchema } from "../enums/AppType.js";
import AppIdSchema from "../ids/AppId.js";
import AppVersionSchema from "./AppVersion.js";

const AppSchema = v.object({
  id: AppIdSchema,
  type: AppTypeSchema,
  name: v.string(),
  latestVersion: AppVersionSchema,
  createdAt: v.date(),
});
export default AppSchema;
export type App = v.InferOutput<typeof AppSchema>;
