import bytesToBinaryString from "./bytesToBinaryString.js";

const Base64Url = {
  /** Encode a utf8 string into a Base64Url string. */
  encodeUtf8(source: string): string {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(source);
    return Base64Url.encodeBytes(bytes);
  },

  /** Decode a Base64Url string into a utf8 string. */
  decodeToUtf8(encoded: string): string {
    if (encoded.length === 0) {
      return "";
    }

    const decoder = new TextDecoder();
    const bytes = Base64Url.decodeToBytes(encoded);
    return decoder.decode(bytes);
  },

  /** Encode a bytes array into a Base64Url string. */
  encodeBytes(source: Uint8Array<ArrayBuffer>): string {
    if (source.length === 0) {
      return "";
    }

    const binary = bytesToBinaryString(source);
    const base64 = btoa(binary);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },

  /** Decode a Base64Url string into a bytes array. */
  decodeToBytes(encoded: string): Uint8Array<ArrayBuffer> {
    if (encoded.length === 0) {
      return new Uint8Array(0);
    }

    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(padding);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  },
};
export default Base64Url;
