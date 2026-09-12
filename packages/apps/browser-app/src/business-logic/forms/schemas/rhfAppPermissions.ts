import { valibotSchemas } from "@superego/shared-utils";
import type { IntlShape } from "react-intl";
import * as v from "valibot";
import type { RHFAppPermissions } from "../utils/RHFAppPermissions.js";

export default function rhfAppPermissions(
  intl: IntlShape,
): v.GenericSchema<RHFAppPermissions, RHFAppPermissions> {
  return v.strictObject({
    modals: v.boolean(),
    downloads: v.boolean(),
    http: v.strictObject({
      allowedOrigins: v.array(
        v.strictObject({
          value: valibotSchemas.httpOrigin(
            intl.formatMessage({
              defaultMessage:
                "Enter a valid HTTP(S) origin without a path, query, or fragment.",
            }),
          ),
        }),
      ),
    }),
  });
}
