import type { AudioContent } from "@superego/backend";
import * as v from "valibot";

export function audioContent(): v.GenericSchema<unknown, AudioContent> {
  return v.looseObject({
    content: v.instance(Uint8Array) as v.GenericSchema<
      unknown,
      Uint8Array<ArrayBuffer>
    >,
    contentType: v.string(),
  });
}
