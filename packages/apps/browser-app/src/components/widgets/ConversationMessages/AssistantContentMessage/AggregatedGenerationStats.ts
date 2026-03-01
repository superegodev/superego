export default interface AggregatedGenerationStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  timeTaken: number;
  cost: number | undefined;
  toolCallCount: number;
}
