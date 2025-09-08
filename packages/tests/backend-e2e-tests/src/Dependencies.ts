import type { Backend } from "@superego/backend";

export type BooleanOracle = (
  question: string,
) => Promise<{ answer: boolean; reason: string }>;

export default interface Dependencies {
  backend: Backend;
  booleanOracle: BooleanOracle;
}
