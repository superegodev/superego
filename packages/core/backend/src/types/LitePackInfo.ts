import type Theme from "../enums/Theme.js";

export default interface LitePackInfo {
  name: string;
  /** Markdown. */
  shortDescription: string;
  /** Contains at most one screenshot per theme. */
  screenshots: {
    theme: Theme.Light | Theme.Dark;
    mimeType: `image/${string}`;
    content: Uint8Array<ArrayBuffer>;
  }[];
}
