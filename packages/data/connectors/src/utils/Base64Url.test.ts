import { fc, it as fit } from "@fast-check/vitest";
import { expect } from "vitest";
import Base64Url from "./Base64Url.js";

fit.prop([fc.string()])("encodes and decodes", (source) => {
  // Exercise
  const encoded = Base64Url.encode(source);
  const decoded = Base64Url.decode(encoded);

  // Verify
  expect(decoded).toEqual(source);
});
