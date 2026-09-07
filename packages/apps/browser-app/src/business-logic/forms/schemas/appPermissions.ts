import type { AppPermissions } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import type { IntlShape } from "react-intl";
import * as v from "valibot";

export default function appPermissions(
  intl: IntlShape,
): v.GenericSchema<AppPermissions, AppPermissions> {
  return v.pipe(
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
  );
}
