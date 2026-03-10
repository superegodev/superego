import type { InferenceOptions } from "@superego/backend";

export default function inferenceOptionsHas<
  Capabilities extends (keyof InferenceOptions)[],
>(
  inferenceOptions: InferenceOptions,
  ...capabilities: Capabilities
): inferenceOptions is InferenceOptions<Capabilities[number]> {
  return capabilities.every(
    (capability) => inferenceOptions[capability] !== null,
  );
}
