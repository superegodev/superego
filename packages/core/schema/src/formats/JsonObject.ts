import * as v from "valibot";
import DataType from "../DataType.js";
import type Format from "../Format.js";
import translate from "../utils/translate.js";
import jsonObject from "../valibot-schemas/jsonObject/jsonObject.js";
import FormatId from "./FormatId.js";

export default [
  {
    dataType: DataType.JsonObject,
    id: FormatId.JsonObject.TiptapRichText,
    name: "Rich Text (Tiptap)",
    description:
      "A rich-text document as represented, in JSON, by the Tiptap rich-text editor.",
    validExamples: [
      { __dataType: DataType.JsonObject, type: "doc", content: [] },
      {
        __dataType: DataType.JsonObject,
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: { textAlign: null },
            content: [{ type: "text", text: "Hello, World!" }],
          },
        ],
      },
    ],
    invalidExamples: [
      { __dataType: DataType.JsonObject, type: "paragraph", content: [] },
    ],
    valibotSchema: v.pipe(
      jsonObject(),
      v.check(
        (jsonObject) =>
          jsonObject["type"] === "doc" && Array.isArray(jsonObject["content"]),
        ({ lang }) =>
          translate(lang, {
            en: "Invalid JsonObject: Not a Tiptap JSON Document",
          }),
      ),
    ),
  },
] satisfies Format<DataType.JsonObject>[];
