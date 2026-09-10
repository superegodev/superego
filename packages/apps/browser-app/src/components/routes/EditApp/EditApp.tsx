import type { AppId } from "@superego/backend";
import { useId, useState } from "react";
import { PiGear, PiFloppyDisk, PiTrash } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import useSaveShortcut from "../../../business-logic/forms/useSaveShortcut.js";
import AppUtils from "../../../utils/AppUtils.js";
import Shell from "../../design-system/Shell/Shell.js";
import CreateNewAppVersionForm from "./CreateNewAppVersionForm.js";
import DeleteAppModalForm from "./DeleteAppModalForm.js";
import * as cs from "./EditApp.css.js";
import UpdateSettingsModalForm from "./UpdateSettingsModalForm.js";

interface Props {
  appId: AppId;
}
export default function EditApp({ appId }: Props) {
  const intl = useIntl();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { apps } = useGlobalData();

  const [isDeleteAppModalFormOpen, setIsDeleteAppModalFormOpen] =
    useState(false);

  const [
    isCreateNewVersionFormSubmitDisabled,
    setIsCreateNewVersionFormSubmitDisabled,
  ] = useState(true);

  const createNewVersionFormId = useId();
  const settingsFormId = useId();
  const [isSettingsFormSubmitDisabled, setIsSettingsFormSubmitDisabled] =
    useState(true);
  useSaveShortcut(
    isSettingsModalOpen ? settingsFormId : createNewVersionFormId,
    isSettingsModalOpen
      ? isSettingsFormSubmitDisabled
      : isCreateNewVersionFormSubmitDisabled,
  );

  const app = AppUtils.findApp(apps, appId);

  return app ? (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage(
          {
            // TODO(formatjs): Remove explicit ID when https://github.com/formatjs/formatjs/issues/6735 is fixed.
            id: "EditApp.tsx_LVy7EO",
            defaultMessage: "🧩\u2002{app} » Edit",
          },
          { app: app.name },
        )}
        actions={[
          {
            icon: <PiGear />,
            label: intl.formatMessage({ defaultMessage: "App settings" }),
            onPress: () => setIsSettingsModalOpen(true),
          },
          {
            icon: <PiFloppyDisk />,
            label: intl.formatMessage({ defaultMessage: "Create new version" }),
            submit: createNewVersionFormId,
            isDisabled: isCreateNewVersionFormSubmitDisabled,
          },
          {
            icon: <PiTrash />,
            label: intl.formatMessage({ defaultMessage: "Delete" }),
            onPress: () => setIsDeleteAppModalFormOpen(true),
            isDanger: true,
          },
        ]}
      />
      <Shell.Panel.Content fullWidth={true} className={cs.EditApp.panelContent}>
        <CreateNewAppVersionForm
          app={app}
          formId={createNewVersionFormId}
          setSubmitDisabled={setIsCreateNewVersionFormSubmitDisabled}
        />
        {isSettingsModalOpen ? (
          <UpdateSettingsModalForm
            app={app}
            formId={settingsFormId}
            setSubmitDisabled={setIsSettingsFormSubmitDisabled}
            onClose={() => setIsSettingsModalOpen(false)}
          />
        ) : null}
        <DeleteAppModalForm
          app={app}
          isOpen={isDeleteAppModalFormOpen}
          onClose={() => setIsDeleteAppModalFormOpen(false)}
        />
      </Shell.Panel.Content>
    </Shell.Panel>
  ) : null;
}
