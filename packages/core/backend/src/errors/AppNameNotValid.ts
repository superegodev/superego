import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import AppIdSchema from "../ids/AppId.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const AppNameNotValidSchema = defineError(
  "AppNameNotValid",
  v.object({
    appId: v.nullable(AppIdSchema),
    issues: v.array(ValidationIssueSchema),
  }),
);
export default AppNameNotValidSchema;
export type AppNameNotValid = v.InferOutput<typeof AppNameNotValidSchema>;
