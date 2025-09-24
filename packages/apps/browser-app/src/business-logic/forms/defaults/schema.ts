import { DataType, type Schema } from "@superego/schema";

export default function schema(): Schema {
  return {
    types: { MyType: { dataType: DataType.Struct, properties: {} } },
    rootType: "MyType",
  };
}
