export default interface LitePackInfo {
  name: string;
  /** Path to the cover image, which must exist in `images`. */
  coverImage: string;
  /** Markdown. */
  shortDescription: string;
  /** Contains only the cover image. */
  images: [
    {
      path: string;
      mimeType: `image/${string}`;
      content: Uint8Array<ArrayBuffer>;
    },
  ];
}
