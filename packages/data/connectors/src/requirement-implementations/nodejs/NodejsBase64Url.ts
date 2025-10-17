import type Base64Url from "../../requirements/Base64Url.js";

export default class NodejsBase64Url implements Base64Url {
  encodeUtf8(source: string): string {
    return Buffer.from(source, "utf8").toString("base64url");
  }

  decodeToUtf8(encoded: string): string {
    return Buffer.from(encoded, "base64url").toString("utf8");
  }

  encodeBytes(source: Uint8Array<ArrayBufferLike>): string {
    return Buffer.from(source).toString("base64url");
  }

  decodeToBytes(encoded: string): Uint8Array<ArrayBufferLike> {
    return new Uint8Array(Buffer.from(encoded, "base64url"));
  }
}
