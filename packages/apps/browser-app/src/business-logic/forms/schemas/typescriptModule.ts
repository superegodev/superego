import type { TypescriptModule } from "@superego/backend";
import type { IntlShape } from "react-intl";
import * as v from "valibot";
import {
  COMPILATION_FAILED,
  COMPILATION_IN_PROGRESS,
  COMPILATION_REQUIRED,
} from "../constants.js";

export default function typescriptModule(
  intl: IntlShape,
): v.GenericSchema<TypescriptModule, TypescriptModule> {
  return v.pipe(
    v.strictObject({
      source: v.string(),
      compiled: v.string(),
    }),
    v.check(
      ({ compiled }) => compiled !== COMPILATION_REQUIRED,
      intl.formatMessage({ defaultMessage: "TypeScript compilation required" }),
    ),
    v.check(
      ({ compiled }) => compiled !== COMPILATION_IN_PROGRESS,
      intl.formatMessage({
        defaultMessage: "TypeScript compilation in progress",
      }),
    ),
    v.check(
      ({ compiled }) => compiled !== COMPILATION_FAILED,
      intl.formatMessage({ defaultMessage: "TypeScript compilation failed" }),
    ),
  );
}
