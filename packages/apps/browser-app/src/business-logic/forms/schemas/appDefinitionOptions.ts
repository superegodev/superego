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
    permissions: v.optional(appPermissionsSchema()),
    state: v.pipe(
      v.strictObject({
        schema: appStateSchema(),
        initialState: v.pipe(
          v.record(v.string(), v.unknown()),
          v.check((value) => isJsonValue(value)),
        ),
        migration: v.optional(typescriptModule(intl)),
      }),
      v.check(
        (state) =>
          v.safeParse(valibotSchemas.content(state.schema), state.initialState)
            .success,
        intl.formatMessage({
          defaultMessage: "Initial state must match the state schema",
        }),
      ),
    ),
  };
}
