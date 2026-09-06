import type { AppPermissions } from "@superego/backend";
import {
  normalizeHttpOrigin,
  appPermissionsSchema,
} from "@superego/shared-utils";
import { useRef } from "react";
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
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import * as cs from "./RHFAppVersionField.css.js";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  isOpen: boolean;
  onClose: () => void;
}
export default function PermissionsModal<T extends FieldValues>({
  control,
  name,
  isOpen,
  onClose,
}: Props<T>) {
  const intl = useIntl();
  const { field: permissionsField, fieldState: permissionsFieldState } =
    useController({ control, name });
  const permissions: AppPermissions = permissionsField.value;
  const originKeys = useRef<string[]>([]);
  const origins = permissions.http.allowedOrigins;
  while (originKeys.current.length < origins.length) {
    originKeys.current.push(crypto.randomUUID());
  }
  const setOrigins = (allowedOrigins: string[]) =>
    permissionsField.onChange({ ...permissions, http: { allowedOrigins } });
  const validation = v.safeParse(appPermissionsSchema(), permissions);
  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage defaultMessage="Permissions" />
      </ModalDialog.Heading>
      <p>
        <FormattedMessage defaultMessage="Permission changes apply when you save the app version." />
      </p>
      <fieldset className={cs.PermissionsModal.fieldset}>
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
            className={cs.PermissionsModal.destination}
            key={originKeys.current[index]}
          >
            <input
              className={cs.PermissionsModal.origin}
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
                originKeys.current.splice(index, 1);
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

      {!validation.success ? (
        <p role="alert">
          <FormattedMessage defaultMessage="Enter a valid HTTP(S) origin without a path, query, or fragment." />
        </p>
      ) : null}
      <ModalDialog.Actions>
        <Button
          onPress={onClose}
          isDisabled={!validation.success}
          variant="primary"
        >
          <FormattedMessage defaultMessage="Done" />
        </Button>
      </ModalDialog.Actions>
    </ModalDialog>
  );
}
