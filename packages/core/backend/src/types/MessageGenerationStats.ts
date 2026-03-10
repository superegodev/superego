import type { Milliseconds } from "@superego/global-types";

export default interface MessageGenerationStats {
  timeTaken: Milliseconds;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost?: number;
}
