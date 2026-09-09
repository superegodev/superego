import { valibotSchemas } from "@superego/shared-utils";
import type { IntlShape } from "react-intl";

export default function appPermissions(intl: IntlShape) {
  return valibotSchemas.appPermissions(
    intl.formatMessage({
      defaultMessage:
        "Enter a valid HTTP(S) origin without a path, query, or fragment.",
    }),
  );
}
