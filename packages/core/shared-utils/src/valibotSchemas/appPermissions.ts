import type { AppPermissions } from "@superego/backend";
import * as v from "valibot";
import httpOrigin from "./httpOrigin.js";

export default function appPermissions(
  httpOriginErrorMessage?: string,
): v.GenericSchema<AppPermissions, AppPermissions> {
  return v.strictObject({
    modals: v.boolean(),
    downloads: v.boolean(),
    http: v.strictObject({
      allowedOrigins: v.array(httpOrigin(httpOriginErrorMessage)),
    }),
  });
}
