export default interface PackInfo {
  name: string;
  /** Markdown. */
  shortDescription: string;
  /** Markdown. */
  longDescription: string;
  screenshots: {
    mimeType: `image/${string}`;
    content: Uint8Array<ArrayBuffer>;
  }[];
}
