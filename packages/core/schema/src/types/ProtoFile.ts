export default interface ProtoFile {
  /**
   * File name + extension.
   * @example book.pdf
   */
  name: string;
  mimeType: string;
  /** The binary content of the file. */
  content: Uint8Array;
}
