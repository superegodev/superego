import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";

const CommandConfirmationNotValidSchema = defineError(
  "CommandConfirmationNotValid",
  v.object({
    suppliedCommandConfirmation: v.string(),
    requiredCommandConfirmation: v.string(),
  }),
);
export default CommandConfirmationNotValidSchema;
export type CommandConfirmationNotValid = v.InferOutput<
  typeof CommandConfirmationNotValidSchema
>;
