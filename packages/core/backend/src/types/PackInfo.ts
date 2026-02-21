import type Theme from "../enums/Theme.js";

export default interface PackInfo {
  name: string;
  /** Markdown. */
  shortDescription: string;
  /** Markdown. */
  longDescription: string;
  screenshots: {
    theme: Theme.Light | Theme.Dark;
    mimeType: `image/${string}`;
    content: Uint8Array<ArrayBuffer>;
  }[];
}
