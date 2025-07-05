import type { DataType } from "@superego/schema";

/**
 * Value serializing to a json object, with property __dataType set to
 * JsonObject to allow to easily identify it as such.
 * @example { __dataType: "JsonObject", key: "value" }
 */
export default interface JsonObject {
  __dataType: DataType.JsonObject;
  [key: string]: any;
}
