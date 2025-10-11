import type { Connector } from "@superego/backend";
import { FormattedMessage, useIntl } from "react-intl";
import toTitleCase from "../../../../utils/toTitleCase.js";
import {
  Description,
  Label,
  Select,
  SelectButton,
  SelectOptions,
} from "../../../design-system/forms/forms.js";

interface Props {
  connectors: Connector[];
  value: Connector | null;
  onChange: (newValue: Connector | null) => void;
  isDisabled: boolean;
}
export default function ConnectorSelect({
  connectors,
  value,
  onChange,
  isDisabled,
}: Props) {
  const intl = useIntl();
  return (
    <Select
      value={value?.name ?? null}
      onChange={(newValue) =>
        onChange(connectors.find(({ name }) => name === newValue) ?? null)
      }
      validationBehavior="aria"
      isDisabled={isDisabled}
    >
      <Label>
        <FormattedMessage defaultMessage="Connector" />
      </Label>
      <SelectButton
        placeholder={intl.formatMessage({
          defaultMessage: "Select a connector",
        })}
      />
      <SelectOptions
        options={connectors.map(({ name }) => ({
          id: name,
          label: toTitleCase(name),
        }))}
      />
      {isDisabled ? (
        <Description>
          <FormattedMessage defaultMessage="The connector cannot be changed once a remote is configured." />
        </Description>
      ) : null}
    </Select>
  );
}
