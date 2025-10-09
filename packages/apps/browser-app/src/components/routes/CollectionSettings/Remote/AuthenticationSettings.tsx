import { ConnectorAuthenticationStrategy } from "@superego/backend";
import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import Fieldset from "../../../design-system/Fieldset/Fieldset.js";
import RHFTextField from "../../../widgets/RHFTextField/RHFTextField.js";
import type FormValues from "./FormValues.js";

interface Props {
  control: Control<FormValues>;
  authenticationStrategy: ConnectorAuthenticationStrategy;
}
export default function AuthenticationSettings({
  control,
  authenticationStrategy,
}: Props) {
  const intl = useIntl();
  return (
    <Fieldset isDisclosureDisabled={true}>
      <Fieldset.Legend>
        <FormattedMessage defaultMessage="Authentication settings" />
      </Fieldset.Legend>
      <Fieldset.Fields>
        {authenticationStrategy === ConnectorAuthenticationStrategy.ApiKey ? (
          <RHFTextField
            control={control}
            name="connectorAuthenticationSettings.apiKey"
            label={intl.formatMessage({ defaultMessage: "API key" })}
          />
        ) : null}
        {authenticationStrategy ===
        ConnectorAuthenticationStrategy.OAuth2PKCE ? (
          <>
            <RHFTextField
              control={control}
              name="connectorAuthenticationSettings.clientId"
              label={intl.formatMessage({ defaultMessage: "Client ID" })}
            />
            <RHFTextField
              control={control}
              name="connectorAuthenticationSettings.clientSecret"
              label={intl.formatMessage({ defaultMessage: "Client secret" })}
              emptyInputValue={null}
            />
          </>
        ) : null}
      </Fieldset.Fields>
    </Fieldset>
  );
}
