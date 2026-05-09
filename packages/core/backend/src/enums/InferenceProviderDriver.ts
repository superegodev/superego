import * as v from "valibot";

enum InferenceProviderDriver {
  OpenResponses = "OpenResponses",
  AnthropicMessages = "AnthropicMessages",
}
export default InferenceProviderDriver;

export const InferenceProviderDriverSchema = v.enum(InferenceProviderDriver);
