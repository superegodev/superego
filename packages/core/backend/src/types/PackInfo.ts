import * as v from "valibot";
import Theme from "../enums/Theme.js";

const PackInfoSchema = v.object({
  name: v.string(),
  shortDescription: v.string(),
  longDescription: v.string(),
  screenshots: v.array(
    v.object({
      theme: v.picklist([Theme.Light, Theme.Dark]),
      mimeType: v.pipe(
        v.string(),
        v.regex(/^image\/.+$/),
      ) as v.GenericSchema<`image/${string}`>,
      content: v.instance(Uint8Array),
    }),
  ),
});
export default PackInfoSchema;
export type PackInfo = v.InferOutput<typeof PackInfoSchema>;
