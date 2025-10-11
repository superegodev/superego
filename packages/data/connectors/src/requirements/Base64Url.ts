export default interface Base64Url {
  /** Encode a utf8 string into a Base64Url string. */
  encodeUtf8(utf8: string): string;
  /** Decode a Base64Url string into a utf8 string. */
  decodeToUtf8(encoded: string): string;
  /** Encode a bytes array into a Base64Url string. */
  encodeBytes(bytes: Uint8Array<ArrayBufferLike>): string;
  /** Decode a Base64Url string into a bytes array. */
  decodeToBytes(encoded: string): Uint8Array<ArrayBufferLike>;
}
