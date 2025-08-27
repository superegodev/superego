import type TypescriptModule from "./TypescriptModule.js";

export default interface SummaryPropertyDefinition {
  /** Name of the property. */
  name: string;
  /** Description of the property. */
  description?: string | undefined;
  /**
   * User-defined function to derive the property's value from the document's
   * content.
   */
  getter: TypescriptModule;
}
