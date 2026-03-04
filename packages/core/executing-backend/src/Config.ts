import type { Milliseconds } from "@superego/global-types";

export default interface Config {
  conversationProcessingStuckTimeout: Milliseconds;
  backgroundJobProcessingStuckTimeout: Milliseconds;
}
