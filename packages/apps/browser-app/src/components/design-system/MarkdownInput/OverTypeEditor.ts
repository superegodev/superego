import type { OverTypeInstance } from "overtype";

/**
 * Extended interface for OverType instance methods that exist in the source
 * code but are not included in the published type definitions.
 * TODO: remove once https://github.com/panphora/overtype/pull/99 is merged and
 * released.
 */
export default interface OverTypeEditor extends OverTypeInstance {
  performAction(actionId: string, event?: Event | null): Promise<boolean>;
}
