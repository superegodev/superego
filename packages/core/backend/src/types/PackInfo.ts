export default interface PackInfo {
  name: string;
  /** Path to the cover image, which must exist in `images`. */
  coverImage: string;
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
