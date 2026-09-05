import type { Schema } from "@superego/schema";
import type TypescriptModule from "./TypescriptModule.js";

export default interface AppStateDefinition {
  schema: Schema;
  initialState: Record<string, unknown>;
  /** Default-exported synchronous (previousContent) => nextContent function. */
  migration?: TypescriptModule | undefined;
}
