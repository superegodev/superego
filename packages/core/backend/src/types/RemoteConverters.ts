import type TypescriptModule from "./TypescriptModule.js";

export default interface RemoteConverters {
  /**
   * Function to transforms a remote document into the content of a local
   * document.
   */
  fromRemoteDocument: TypescriptModule;
  /**
   * Function to transforms a local document content into a proto remote
   * document, from which a remote document will be created.
   */
  toProtoRemoteDocument: TypescriptModule | null;
}
