export default interface LitePackInfo {
  name: string;
  /** Markdown. */
  shortDescription: string;
  /** Contains only the first image, if there is one. */
  images:
    | []
    | [
        {
          path: string;
          mimeType: `image/${string}`;
          content: Uint8Array<ArrayBuffer>;
        },
      ];
}
