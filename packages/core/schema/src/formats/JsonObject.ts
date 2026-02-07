import * as v from "valibot";
import DataType from "../DataType.js";
import type Format from "../Format.js";
import translate from "../utils/translate.js";
import jsonObject from "../valibot-schemas/jsonObject/jsonObject.js";
import FormatId from "./FormatId.js";

export default [
  {
    dataType: DataType.JsonObject,
    id: FormatId.JsonObject.GeoJSON,
    name: "GeoJSON",
    description:
      "A GeoJSON object (Feature, FeatureCollection, or Geometry) encoded as JSON.",
    validExamples: [
      {
        __dataType: DataType.JsonObject,
        type: "FeatureCollection",
        features: [],
      },
      {
        __dataType: DataType.JsonObject,
        type: "Feature",
        geometry: { type: "Point", coordinates: [12.4924, 41.8902] },
        properties: { name: "Colosseum" },
      },
      {
        __dataType: DataType.JsonObject,
        type: "Polygon",
        coordinates: [
          [
            [12.48, 41.89],
            [12.49, 41.89],
            [12.49, 41.9],
            [12.48, 41.9],
            [12.48, 41.89],
          ],
        ],
      },
    ],
    invalidExamples: [
      { __dataType: DataType.JsonObject, type: "FeatureCollection" },
      {
        __dataType: DataType.JsonObject,
        type: "Feature",
        properties: { missing: "geometry" },
      },
      { __dataType: DataType.JsonObject, type: "Point" },
      { __dataType: DataType.JsonObject, type: "UnknownType" },
    ],
    valibotSchema: v.pipe(
      jsonObject(),
      v.check(
        (value) => isGeoJsonObject(value),
        ({ lang }) =>
          translate(lang, {
            en: "Invalid JsonObject: Not a GeoJSON object",
          }),
      ),
    ),
  },
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

function isGeoJsonObject(value: Record<string, any>): boolean {
  const geoJsonTypes = new Set([
    "FeatureCollection",
    "Feature",
    "Point",
    "MultiPoint",
    "LineString",
    "MultiLineString",
    "Polygon",
    "MultiPolygon",
    "GeometryCollection",
  ]);
  const type = value["type"];
  if (typeof type !== "string" || !geoJsonTypes.has(type)) {
    return false;
  }
  if (type === "FeatureCollection") {
    return Array.isArray(value["features"]);
  }
  if (type === "Feature") {
    return typeof value["geometry"] === "object" && value["geometry"] !== null;
  }
  if (type === "GeometryCollection") {
    return Array.isArray(value["geometries"]);
  }
  return value["coordinates"] !== undefined;
}
