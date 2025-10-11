import { fc, it as fit } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";
import type Base64Url from "../Base64Url.js";

export default function registerBase64UrlTests(getBase64Url: () => Base64Url) {
  it("encodeUtf8", () => {
    // Setup SUT
    const base64Url = getBase64Url();

    // Exercise
    const value = base64Url.encodeUtf8("test");

    // Verify
    expect(value).toEqual("dGVzdA");
  });

  it("decodeUtf8", () => {
    // Setup SUT
    const base64Url = getBase64Url();

    // Exercise
    const value = base64Url.decodeToUtf8("dGVzdA");

    // Verify
    expect(value).toEqual("test");
  });

  it("encodeBytes", () => {
    // Setup SUT
    const base64Url = getBase64Url();

    // Exercise
    const value = base64Url.encodeBytes(new TextEncoder().encode("test"));

    // Verify
    expect(value).toEqual("dGVzdA");
  });

  it("decodeUtf8", () => {
    // Setup SUT
    const base64Url = getBase64Url();

    // Exercise
    const value = base64Url.decodeToBytes("dGVzdA");

    // Verify
    expect(value).toEqual(new TextEncoder().encode("test"));
  });

  describe("round trips", () => {
    fit.prop([fc.string()])("utf8 -> base64Url -> utf8", (initialValue) => {
      // Setup SUT
      const base64Url = getBase64Url();

      // Exercise
      const roundTripValue = base64Url.decodeToUtf8(
        base64Url.encodeUtf8(initialValue),
      );

      // Verify
      expect(roundTripValue).toEqual(initialValue);
    });

    fit.prop([fc.uint8Array()])(
      "bytes -> base64Url -> bytes",
      (initialValue) => {
        // Setup SUT
        const base64Url = getBase64Url();

        // Exercise
        const roundTripValue = base64Url.decodeToBytes(
          base64Url.encodeBytes(initialValue),
        );

        // Verify
        expect(roundTripValue).toEqual(initialValue);
      },
    );

    fit.prop([fc.string()])(
      "utf8 -> base64Url -> bytes -> base64Url -> utf8",
      (initialValue) => {
        // Setup SUT
        const base64Url = getBase64Url();

        // Exercise
        const roundTripValue = base64Url.decodeToUtf8(
          base64Url.encodeBytes(
            base64Url.decodeToBytes(base64Url.encodeUtf8(initialValue)),
          ),
        );

        // Verify
        expect(roundTripValue).toEqual(initialValue);
      },
    );
  });
}
