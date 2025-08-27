import type { SummaryPropertyDefinition } from "@superego/backend";
import type { IntlShape } from "react-intl";
import * as v from "valibot";
import typescriptModule from "./typescriptModule.js";

export default function summaryPropertyDefinition(
  intl: IntlShape,
): v.GenericSchema<SummaryPropertyDefinition, SummaryPropertyDefinition> {
  return v.strictObject({
    name: v.string(),
    description: v.optional(v.string()),
    getter: typescriptModule(intl),
  });
}
