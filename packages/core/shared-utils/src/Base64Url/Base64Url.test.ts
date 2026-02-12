import { fc, it as fit } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";
import Base64Url from "./Base64Url.js";

it("encodeUtf8", () => {
  // Setup SUT

  // Exercise
  const value = Base64Url.encodeUtf8("test");

  // Verify
  expect(value).toEqual("dGVzdA");
});

it("decodeUtf8", () => {
  // Setup SUT

  // Exercise
  const value = Base64Url.decodeToUtf8("dGVzdA");

  // Verify
  expect(value).toEqual("test");
});

it("encodeBytes", () => {
  // Setup SUT

  // Exercise
  const value = Base64Url.encodeBytes(new TextEncoder().encode("test"));

  // Verify
  expect(value).toEqual("dGVzdA");
});

it("decodeToBytes", () => {
  // Setup SUT

  // Exercise
  const value = Base64Url.decodeToBytes("dGVzdA");

  // Verify
  expect(value).toEqual(new TextEncoder().encode("test"));
});

describe("round trips", () => {
  fit.prop([fc.string()])("utf8 -> Base64Url -> utf8", (initialValue) => {
    // Setup SUT

    // Exercise
    const roundTripValue = Base64Url.decodeToUtf8(
      Base64Url.encodeUtf8(initialValue),
    );

    // Verify
    expect(roundTripValue).toEqual(initialValue);
  });

  fit.prop([fc.uint8Array()])("bytes -> Base64Url -> bytes", (initialValue) => {
    // Setup SUT

    // Exercise
    const roundTripValue = Base64Url.decodeToBytes(
      Base64Url.encodeBytes(initialValue),
    );

    // Verify
    expect(roundTripValue).toEqual(initialValue);
  });

  fit.prop([fc.string()])(
    "utf8 -> Base64Url -> bytes -> Base64Url -> utf8",
    (initialValue) => {
      // Setup SUT

      // Exercise
      const roundTripValue = Base64Url.decodeToUtf8(
        Base64Url.encodeBytes(
          Base64Url.decodeToBytes(Base64Url.encodeUtf8(initialValue)),
        ),
      );

      // Verify
      expect(roundTripValue).toEqual(initialValue);
    },
  );
});
