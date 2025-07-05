import type { I18nString } from "@superego/global-types";
import type * as v from "valibot";
import type DataType from "./DataType.js";
import type JsonObject from "./types/JsonObject.js";

export default interface Format<
  DataTypeWithFormat extends
    | DataType.String
    | DataType.Number
    | DataType.JsonObject =
    | DataType.String
    | DataType.Number
    | DataType.JsonObject,
  Value = DataTypeWithFormat extends DataType.String
    ? string
    : DataTypeWithFormat extends DataType.Number
      ? number
      : DataTypeWithFormat extends DataType.JsonObject
        ? JsonObject
        : never,
> {
  dataType: DataTypeWithFormat;
  id: string;
  name: I18nString;
  description: I18nString;
  validExamples: Value[];
  invalidExamples: Value[];
  valibotSchema: v.GenericSchema<Value, Value>;
}
