import type { IntlShape } from "react-intl";
import * as v from "valibot";
import type { RHFAppVersionFiles } from "../utils/RHFAppVersionFiles.js";
import typescriptModule from "./typescriptModule.js";

export default function rhfAppVersionFiles(
  intl: IntlShape,
): v.GenericSchema<RHFAppVersionFiles, RHFAppVersionFiles> {
  return v.strictObject({
    "/main__DOT__tsx": typescriptModule(intl),
  });
}
