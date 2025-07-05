import * as v from "valibot";
import DataType from "../../DataType.js";
import type JsonObject from "../../types/JsonObject.js";
import isJsonInvariant from "./checks/isJsonInvariant.js";
import serializesAsJsonObject from "./checks/serializesAsJsonObject.js";

export default function jsonObject(): v.GenericSchema<JsonObject, JsonObject> {
  return v.pipe(
    v.nonNullable(v.any()),
    serializesAsJsonObject,
    v.looseObject({ __dataType: v.literal(DataType.JsonObject) }),
    isJsonInvariant,
  );
}
