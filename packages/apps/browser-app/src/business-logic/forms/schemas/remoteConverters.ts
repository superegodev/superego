import type { RemoteConverters } from "@superego/backend";
import type { IntlShape } from "react-intl";
import * as v from "valibot";
import typescriptModule from "./typescriptModule.js";

export default function remoteConverters(
  intl: IntlShape,
): v.GenericSchema<RemoteConverters, RemoteConverters> {
  return v.strictObject({
    fromRemoteDocument: typescriptModule(intl),
  });
}
