import type { AppStateDefinition } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import type { IntlShape } from "react-intl";
import * as v from "valibot";
import typescriptModule from "./typescriptModule.js";

export default function appStateDefinition(
  intl: IntlShape,
): v.GenericSchema<AppStateDefinition, AppStateDefinition> {
  return v.pipe(
    v.strictObject({
      schema: valibotSchemas.appStateSchema(),
      initialState: v.record(v.string(), v.unknown()),
      migration: v.nullable(typescriptModule(intl)),
    }),
    v.check(
      (stateDefinition) =>
        v.safeParse(
          valibotSchemas.appStateContent(stateDefinition.schema),
          stateDefinition.initialState,
        ).success,
      intl.formatMessage({
        defaultMessage: "Initial state must match the state schema",
      }),
    ),
  );
}
