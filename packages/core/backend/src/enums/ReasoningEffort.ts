import * as v from "valibot";

enum ReasoningEffort {
  None = "none",
  Low = "low",
  Medium = "medium",
  High = "high",
  XHigh = "xhigh",
}
export default ReasoningEffort;

export const ReasoningEffortSchema = v.enum(ReasoningEffort);
