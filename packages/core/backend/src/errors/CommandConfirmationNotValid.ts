import type { ResultError } from "@superego/global-types";

type CommandConfirmationNotValid = ResultError<
  "CommandConfirmationNotValid",
  {
    suppliedCommandConfirmation: string;
    requiredCommandConfirmation: string;
  }
>;
export default CommandConfirmationNotValid;
