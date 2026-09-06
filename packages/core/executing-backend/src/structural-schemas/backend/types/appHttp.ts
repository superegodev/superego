import type { AppHttpResponse } from "@superego/backend";
import * as v from "valibot";

export function appHttpResponse(): v.GenericSchema<unknown, AppHttpResponse> {
  return v.strictObject({
    status: v.pipe(v.number(), v.integer(), v.minValue(100), v.maxValue(599)),
    headers: v.array(v.tuple([v.string(), v.string()])),
    body: v.strictObject({ encoding: v.literal("base64"), data: v.string() }),
    url: v.string(),
  });
}
