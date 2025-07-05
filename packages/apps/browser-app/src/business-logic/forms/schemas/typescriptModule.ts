import type { TypescriptModule } from "@superego/backend";
import type { IntlShape } from "react-intl";
import * as v from "valibot";
import { FAILED_COMPILATION_OUTPUT } from "../constants.js";

export default function typescriptModule(
  intl: IntlShape,
): v.GenericSchema<TypescriptModule, TypescriptModule> {
  return v.pipe(
    v.strictObject({
      source: v.string(),
      compiled: v.string(),
    }),
    v.check(
      ({ compiled }) => compiled !== FAILED_COMPILATION_OUTPUT,
      intl.formatMessage({ defaultMessage: "TypeScript compilation failed" }),
    ),
  );
}
