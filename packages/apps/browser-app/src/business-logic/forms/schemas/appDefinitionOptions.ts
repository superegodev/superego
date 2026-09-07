import type { AppPermissions } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import type { IntlShape } from "react-intl";
import * as v from "valibot";
import typescriptModule from "./typescriptModule.js";

export default function appDefinitionOptions(intl: IntlShape) {
  return {
    permissions: v.pipe(
      v.any(),
      v.check(
        (permissions: AppPermissions) =>
          permissions.http.allowedOrigins.every((origin) =>
            v.is(valibotSchemas.httpOrigin(), origin),
          ),
        intl.formatMessage({
          defaultMessage:
            "Enter a valid HTTP(S) origin without a path, query, or fragment.",
        }),
      ),
    ),
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
