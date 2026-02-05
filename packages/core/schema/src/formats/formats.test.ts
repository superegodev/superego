import * as v from "valibot";
import { describe, expect, it } from "vitest";
import type Format from "../Format.js";
import formats from "./formats.js";

Object.values(formats)
  .flat()
  .forEach((format: Format) => {
    describe(`${format.dataType} format: ${format.id}`, () => {
      describe("valid", () => {
        format.validExamples.forEach((value) => {
          it(`${JSON.stringify(value)}`, () => {
            expect(v.is(format.valibotSchema, value)).toBe(true);
          });
        });
      });
      if (format.invalidExamples.length > 0) {
        describe("not valid", () => {
          format.invalidExamples.forEach((value) => {
            it(`${JSON.stringify(value)}`, () => {
              expect(v.is(format.valibotSchema, value)).toBe(false);
            });
          });
        });
      }
    });
  });
