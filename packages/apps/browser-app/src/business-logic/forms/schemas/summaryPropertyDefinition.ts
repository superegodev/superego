import type { SummaryPropertyDefinition } from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import type { IntlShape } from "react-intl";
import * as v from "valibot";
import typescriptModule from "./typescriptModule.js";

export default function summaryPropertyDefinition(
  intl: IntlShape,
): v.GenericSchema<SummaryPropertyDefinition, SummaryPropertyDefinition> {
  return v.strictObject({
    name: valibotSchemas.i18nString(),
    description: v.optional(valibotSchemas.i18nString()),
    getter: typescriptModule(intl),
  });
}
