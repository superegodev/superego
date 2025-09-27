import { DataType, FormatId } from "@superego/schema";
import type CollectionDefinition from "../utils/CollectionDefinition.js";

export default {
  name: "Weigh-ins",
  schema: {
    types: {
      WeighIn: {
        dataType: DataType.Struct,
        properties: {
          date: {
            dataType: DataType.String,
            format: FormatId.String.PlainDate,
          },
          weight: {
            dataType: DataType.Number,
          },
        },
      },
    },
    rootType: "WeighIn",
  },
  contentSummaryGetter: `
import type { WeighIn } from "./CollectionSchema.js";

export default function getContentSummary(
  weighIn: WeighIn
): Record<string, string | number | boolean | null> {
  return {
    "1. Date": weighIn.date,
    "2. Weight (kg)": weighIn.weight,
  };
}
  `.trim(),
} satisfies CollectionDefinition;
