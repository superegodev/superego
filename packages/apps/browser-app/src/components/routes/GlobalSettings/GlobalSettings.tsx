import { useState } from "react";
import { PiFloppyDisk } from "react-icons/pi";
import { useIntl } from "react-intl";
import useSaveShortcut from "../../../business-logic/forms/useSaveShortcut.js";
import Shell from "../../design-system/Shell/Shell.js";
import UpdateGlobalSettingsForm from "./UpdateGlobalSettingsForm.js";

export default function GlobalSettings() {
  const intl = useIntl();
  const updateFormId = "UpdateGlobalSettingsForm";
  const [isUpdateFormSubmitDisabled, setIsUpdateFormSubmitDisabled] =
    useState(true);
  useSaveShortcut(updateFormId, isUpdateFormSubmitDisabled);
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage({
          defaultMessage: "Superego Global Settings",
        })}
        actionsAriaLabel={intl.formatMessage({
          defaultMessage: "Settings actions",
        })}
        actions={[
          {
            label: intl.formatMessage({ defaultMessage: "Save" }),
            icon: <PiFloppyDisk />,
            submit: updateFormId,
            isDisabled: isUpdateFormSubmitDisabled,
          },
        ]}
      />
      <Shell.Panel.Content>
        <UpdateGlobalSettingsForm
          formId={updateFormId}
          setSubmitDisabled={setIsUpdateFormSubmitDisabled}
        />
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}
