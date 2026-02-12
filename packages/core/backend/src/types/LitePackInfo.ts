export default interface LitePackInfo {
  name: string;
  /** Markdown. */
  shortDescription: string;
  /** Contains only the first screenshot, if there is one. */
  screenshots:
    | []
    | [{ mimeType: `image/${string}`; content: Uint8Array<ArrayBuffer> }];
}
