import type NonEmptyArray from "./NonEmptyArray.js";
import type SummaryPropertyDefinition from "./SummaryPropertyDefinition.js";

export default interface CollectionVersionSettings {
  summaryProperties: NonEmptyArray<SummaryPropertyDefinition>;
}
