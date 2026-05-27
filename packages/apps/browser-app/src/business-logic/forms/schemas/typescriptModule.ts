import type { TypescriptModule } from "@superego/backend";
import type { IntlShape } from "react-intl";
import * as v from "valibot";

export default function typescriptModule(
  _intl: IntlShape,
): v.GenericSchema<TypescriptModule, TypescriptModule> {
  return v.string();
}
