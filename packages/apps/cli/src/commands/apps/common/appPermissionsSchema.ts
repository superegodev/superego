import type { AppPermissions } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import * as v from "valibot";

export default function appPermissionsSchema(): v.GenericSchema<
  AppPermissions,
  AppPermissions
> {
  return v.strictObject({
    modals: v.boolean(),
    downloads: v.boolean(),
    http: v.strictObject({
      allowedOrigins: v.array(valibotSchemas.httpOrigin()),
    }),
  });
}
