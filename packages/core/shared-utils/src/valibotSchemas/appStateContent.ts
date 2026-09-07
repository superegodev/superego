import { type Schema, valibotSchemas } from "@superego/schema";
import * as v from "valibot";

export default function appStateContent(schema: Schema) {
  return v.pipe(valibotSchemas.jsonValue(), valibotSchemas.content(schema));
}
