import type TypescriptModule from "./TypescriptModule.js";

export default interface CollectionVersionSettings {
  contentSummaryGetter: TypescriptModule;
  contentFingerprintGetter: TypescriptModule | null;
}
