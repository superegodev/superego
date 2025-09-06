import type { SummaryPropertyDefinition } from "@superego/backend";
import type { Schema } from "@superego/schema";
import type { IntlShape } from "react-intl";
import summaryPropertyDefinitionGetter from "./summaryPropertyDefinitionGetter.js";

export default function summaryPropertyDefinition(
  index: number,
  schema: Schema,
  schemaTypescriptLibPath: string,
  intl: IntlShape,
): SummaryPropertyDefinition {
  return index === 0
    ? {
        name: intl.formatMessage({ defaultMessage: "Name" }),
        getter: summaryPropertyDefinitionGetter(
          schema,
          schemaTypescriptLibPath,
        ),
      }
    : {
        name: intl.formatMessage(
          { defaultMessage: "Summary property {position}" },
          { position: index + 1 },
        ),
        getter: summaryPropertyDefinitionGetter(
          schema,
          schemaTypescriptLibPath,
        ),
      };
}
