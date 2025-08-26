import type ToolResultError from "./ToolResultError.js";

type ToolResultOutput<Data, Error extends ToolResultError> =
  | { success: true; data: Data }
  | { success: false; error: Error };
export default ToolResultOutput;
