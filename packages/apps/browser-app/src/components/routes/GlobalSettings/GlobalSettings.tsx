import { useIntl } from "react-intl";
import Shell from "../../design-system/Shell/Shell.js";
import UpdateGlobalSettingsForm from "./UpdateGlobalSettingsForm.js";

export default function Settings() {
  const intl = useIntl();
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage({
          defaultMessage: "Superego Global Settings",
        })}
      />
      <Shell.Panel.Content>
        <UpdateGlobalSettingsForm />
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}
