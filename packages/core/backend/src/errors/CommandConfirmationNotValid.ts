import type RpcError from "../types/RpcError.js";

type CommandConfirmationNotValid = RpcError<
  "CommandConfirmationNotValid",
  {
    suppliedCommandConfirmation: string;
    requiredCommandConfirmation: string;
  }
>;
export default CommandConfirmationNotValid;
