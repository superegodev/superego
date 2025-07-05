import * as v from "valibot";
import DataType from "../DataType.js";
import type Format from "../Format.js";
import FormatId from "./FormatId.js";

export default [
  {
    dataType: DataType.Number,
    id: FormatId.Number.Integer,
    name: {
      en: "Integer",
    },
    description: {
      en: "An integer",
    },
    validExamples: [-1, 0, 1],
    invalidExamples: [1.1, Math.PI],
    valibotSchema: v.pipe(v.number(), v.integer()),
  },
] satisfies Format<DataType.Number>[];
