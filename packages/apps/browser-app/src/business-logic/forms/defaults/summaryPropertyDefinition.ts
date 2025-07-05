import type { SummaryPropertyDefinition } from "@superego/backend";
import type { Schema } from "@superego/schema";
import type { IntlShape } from "react-intl";
import getLanguageCode from "../../../utils/getLanguageCode.js";
import summaryPropertyDefinitionGetter from "./summaryPropertyDefinitionGetter.js";

export default function summaryPropertyDefinition(
  index: number,
  schema: Schema,
  schemaTypescriptLibPath: string,
  intl: IntlShape,
): SummaryPropertyDefinition {
  const languageCode = getLanguageCode(intl);
  return index === 0
    ? {
        name: {
          en: "Name",
          [languageCode]: intl.formatMessage({ defaultMessage: "Name" }),
        },
        description: {
          en: "The name of the document.",
          [languageCode]: intl.formatMessage({
            defaultMessage: "Name of the document",
          }),
        },
        getter: summaryPropertyDefinitionGetter(
          schema,
          schemaTypescriptLibPath,
        ),
      }
    : {
        name: {
          en: `Summary property ${index + 1}`,
          [languageCode]: intl.formatMessage(
            { defaultMessage: "Summary property {position}" },
            { position: index + 1 },
          ),
        },
        description: { en: "", [languageCode]: "" },
        getter: summaryPropertyDefinitionGetter(
          schema,
          schemaTypescriptLibPath,
        ),
      };
}
