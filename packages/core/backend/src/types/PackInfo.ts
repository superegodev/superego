export default interface PackInfo {
  name: string;
  /** Markdown. */
  shortDescription: string;
  /** Markdown. Can use images in `images`. */
  longDescription: string;
  images: {
    path: string;
    mimeType: `image/${string}`;
    content: Uint8Array<ArrayBuffer>;
  }[];
}
