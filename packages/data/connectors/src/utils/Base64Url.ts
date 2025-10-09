import { decode, encode } from "universal-base64url";

export default {
  encode(source: string): string {
    return encode(source);
  },

  decode(encoded: string): string {
    return decode(encoded);
  },
};
