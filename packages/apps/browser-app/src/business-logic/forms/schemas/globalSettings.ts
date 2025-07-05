import { type GlobalSettings, Theme } from "@superego/backend";
import * as v from "valibot";

export default function globalSettings(): v.GenericSchema<
  GlobalSettings,
  GlobalSettings
> {
  return v.strictObject({
    theme: v.picklist(Object.values(Theme)),
  });
}
