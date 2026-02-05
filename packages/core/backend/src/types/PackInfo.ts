export default interface PackInfo {
  name: string;
  coverImage: string;
  /** Markdown */
  shortDescription: string;
  /** Markdown */
  longDescription: string;
  images: { path: string; content: Uint8Array<ArrayBuffer> }[];
}
