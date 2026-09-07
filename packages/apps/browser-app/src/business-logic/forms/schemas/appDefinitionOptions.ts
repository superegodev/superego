import { valibotSchemas } from "@superego/schema";
import {
  appPermissionsSchema,
  appStateSchema,
  isJsonValue,
} from "@superego/shared-utils";
import type { IntlShape } from "react-intl";
import * as v from "valibot";
import typescriptModule from "./typescriptModule.js";

export default function appDefinitionOptions(intl: IntlShape) {
  return {
    permissions: appPermissionsSchema(),
    stateDefinition: v.pipe(
      v.strictObject({
        schema: appStateSchema(),
        initialState: v.pipe(
          v.record(v.string(), v.unknown()),
          v.check((value) => isJsonValue(value)),
        ),
        migration: v.nullable(typescriptModule(intl)),
      }),
      v.check(
        (stateDefinition) =>
          v.safeParse(
            valibotSchemas.content(stateDefinition.schema),
            stateDefinition.initialState,
          ).success,
        intl.formatMessage({
          defaultMessage: "Initial state must match the state schema",
        }),
      ),
    ),
  };
}
