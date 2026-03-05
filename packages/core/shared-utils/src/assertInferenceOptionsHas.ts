import type { InferenceOptions } from "@superego/backend";
import inferenceOptionsHas from "./inferenceOptionsHas.js";

export default function assertInferenceOptionsHas<
  Capabilities extends (keyof InferenceOptions)[],
>(
  inferenceOptions: InferenceOptions,
  ...capabilities: Capabilities
): asserts inferenceOptions is InferenceOptions<Capabilities[number]> {
  if (!inferenceOptionsHas(inferenceOptions, ...capabilities)) {
    const message = `inferenceOptions expected to have capabilities ${capabilities.join(", ")}`;
    console.error(message, { inferenceOptions, capabilities });
    throw new Error(message);
  }
}
