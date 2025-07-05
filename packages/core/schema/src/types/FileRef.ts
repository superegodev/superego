export default interface FileRef {
  id: string;
  /**
   * Name + extension.
   * @example book.pdf
   */
  name: string;
  mimeType: string;
}
