import type { AppPermissions } from "@superego/backend";
import { normalizeHttpOrigin, valibotSchemas } from "@superego/shared-utils";
import { useState } from "react";
import {
  useController,
  type Control,
  type FieldValues,
  type FieldPath,
} from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { electronMainWorld } from "../../../business-logic/electron/electron.js";
import forms from "../../../business-logic/forms/forms.js";
import Button from "../../design-system/Button/Button.js";
import Switch from "../../design-system/forms/Switch.js";
import * as cs from "./RHFAppPermissionsField.css.js";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
}
export default function RHFAppPermissionsField<T extends FieldValues>({
  control,
  name,
}: Props<T>) {
  const intl = useIntl();
  const { field: permissionsField, fieldState: permissionsFieldState } =
    useController({ control, name });
  const permissions: AppPermissions = permissionsField.value;
  const origins = permissions.http.allowedOrigins;
  const [storedOriginKeys, setOriginKeys] = useState(() =>
    origins.map((_, index) => index),
  );
  const nextKey = (storedOriginKeys.at(-1) ?? -1) + 1;
  const originKeys =
    storedOriginKeys.length < origins.length
      ? [
          ...storedOriginKeys,
          ...Array.from(
            { length: origins.length - storedOriginKeys.length },
            (_, index) => nextKey + index,
          ),
        ]
      : storedOriginKeys;
  if (originKeys !== storedOriginKeys) {
    setOriginKeys(originKeys);
  }
  const setOrigins = (allowedOrigins: string[]) =>
    permissionsField.onChange({ ...permissions, http: { allowedOrigins } });
  const originsValid = origins.every((origin) =>
    v.is(valibotSchemas.httpOrigin(), origin),
  );
  return (
    <>
      <fieldset className={cs.RHFAppPermissionsField.fieldset}>
        {forms.utils
          .flattenError(permissionsFieldState.error)
          .map(({ message, path }) => (
            <p role="alert" key={`${path}:${message}`}>
              {message}
            </p>
          ))}
        <Switch
          isSelected={permissions.modals}
          onChange={(modals) =>
            permissionsField.onChange({ ...permissions, modals })
          }
        >
          <FormattedMessage defaultMessage="Allow browser dialogs and printing" />
        </Switch>
        <p>
          <FormattedMessage defaultMessage="Enables printing, alert, confirm, prompt, and other browser modal dialogs." />
        </p>
        <Switch
          isSelected={permissions.downloads}
          onChange={(downloads) =>
            permissionsField.onChange({ ...permissions, downloads })
          }
        >
          <FormattedMessage defaultMessage="Allow file downloads" />
        </Switch>
        <p>
          <FormattedMessage defaultMessage="Allow HTTP requests to these destinations:" />
        </p>
        {origins.map((origin, index) => (
          <div
            className={cs.RHFAppPermissionsField.destination}
            key={originKeys[index]}
          >
            <input
              className={cs.RHFAppPermissionsField.origin}
              aria-label={intl.formatMessage({ defaultMessage: "HTTP origin" })}
              value={origin}
              placeholder="https://api.example.com"
              onChange={(event) =>
                setOrigins(
                  origins.map((value, position) =>
                    position === index ? event.target.value : value,
                  ),
                )
              }
              onBlur={(event) => {
                try {
                  setOrigins(
                    origins.map((value, position) =>
                      position === index
                        ? normalizeHttpOrigin(event.target.value)
                        : value,
                    ),
                  );
                } catch {
                  /* Validation is shown by the form on save. */
                }
              }}
            />
            <Button
              type="button"
              onPress={() => {
                setOriginKeys(
                  originKeys.filter((_, position) => position !== index),
                );
                setOrigins(origins.filter((_, position) => position !== index));
              }}
            >
              <FormattedMessage defaultMessage="Remove destination" />
            </Button>
          </div>
        ))}
        <Button type="button" onPress={() => setOrigins([...origins, ""])}>
          <FormattedMessage defaultMessage="Add destination" />
        </Button>
        <p>
          <FormattedMessage defaultMessage="Use HTTP(S) origins with no path, such as https://api.example.com or http://localhost:8080. A service URL stored in state does not grant access." />
        </p>
        {!electronMainWorld.isElectron ? (
          <p>
            <FormattedMessage defaultMessage="You are running Superego in the browser. If requests are blocked by CORS, configure a browser extension to allow them." />
          </p>
        ) : null}
        <p>
          <FormattedMessage defaultMessage="Allowed destinations apply to app connections. Built-in sandbox resources and map tiles remain available." />
        </p>
      </fieldset>

      {!originsValid ? (
        <p role="alert">
          <FormattedMessage defaultMessage="Enter a valid HTTP(S) origin without a path, query, or fragment." />
        </p>
      ) : null}
    </>
  );
}
