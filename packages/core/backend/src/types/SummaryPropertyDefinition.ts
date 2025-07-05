import type { I18nString } from "@superego/global-types";
import type TypescriptModule from "./TypescriptModule.js";

export default interface SummaryPropertyDefinition {
  /** Name of the property. */
  name: I18nString;
  /** Description of the property. */
  description?: I18nString | undefined;
  /**
   * User-defined function to derive the property's value from the document's
   * content.
   */
  getter: TypescriptModule;
}
