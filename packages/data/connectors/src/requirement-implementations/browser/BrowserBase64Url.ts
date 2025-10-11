import type Base64Url from "../../requirements/Base64Url.js";

export default class BrowserBase64Url implements Base64Url {
  encodeUtf8(source: string): string {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(source);
    return this.encodeBytes(bytes);
  }

  decodeToUtf8(encoded: string): string {
    if (encoded.length === 0) {
      return "";
    }

    const decoder = new TextDecoder();
    const bytes = this.decodeToBytes(encoded);
    return decoder.decode(bytes);
  }

  encodeBytes(source: Uint8Array<ArrayBufferLike>): string {
    if (source.length === 0) {
      return "";
    }

    const binary = bytesToBinaryString(source);
    const base64 = btoa(binary);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  decodeToBytes(encoded: string): Uint8Array<ArrayBufferLike> {
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
  }
}

function bytesToBinaryString(bytes: Uint8Array<ArrayBufferLike>): string {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return binary;
}
