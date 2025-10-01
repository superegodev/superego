import type TypescriptModule from "./TypescriptModule.js";

export default interface RemoteConverters {
  /** Function to transforms a remote document into a local document. */
  fromRemoteDocument: TypescriptModule;
}
