import * as structuralSchemas from "@superego/executing-backend/structural-schemas";
import { valibotSchemas } from "@superego/shared-utils";
import type { IntlShape } from "react-intl";
import * as v from "valibot";
import typescriptModule from "./typescriptModule.js";

export default function appDefinitionOptions(intl: IntlShape) {
  return {
    permissions: structuralSchemas.backend.types.appPermissions(),
    stateDefinition: v.pipe(
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
    ),
  };
}
