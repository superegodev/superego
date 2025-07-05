import type {
  NonEmptyArray,
  SummaryPropertyDefinition,
} from "@superego/backend";
import type { IntlShape } from "react-intl";
import * as v from "valibot";
import summaryPropertyDefinition from "./summaryPropertyDefinition.js";

export default function summaryPropertyDefinitions(
  intl: IntlShape,
): v.GenericSchema<
  NonEmptyArray<SummaryPropertyDefinition>,
  NonEmptyArray<SummaryPropertyDefinition>
> {
  return v.pipe(
    v.array(summaryPropertyDefinition(intl)),
    v.minLength(1),
  ) as any;
}
