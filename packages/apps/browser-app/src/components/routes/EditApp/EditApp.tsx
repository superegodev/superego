import type { AppId } from "@superego/backend";
import { useId, useState } from "react";
import {
  PiShieldCheck,
  PiDatabase,
  PiFloppyDisk,
  PiPencilSimple,
  PiTrash,
} from "react-icons/pi";
import { useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import useSaveShortcut from "../../../business-logic/forms/useSaveShortcut.js";
import AppUtils from "../../../utils/AppUtils.js";
import Shell from "../../design-system/Shell/Shell.js";
import CreateNewAppVersionForm from "./CreateNewAppVersionForm.js";
import DeleteAppModalForm from "./DeleteAppModalForm.js";
import * as cs from "./EditApp.css.js";
import UpdateNameModalForm from "./UpdateNameModalForm.js";
import UpdatePermissionsModalForm from "./UpdatePermissionsModalForm.js";

interface Props {
  appId: AppId;
}
export default function EditApp({ appId }: Props) {
  const intl = useIntl();
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const { apps } = useGlobalData();

  const [isUpdateNameModalFormOpen, setIsUpdateNameModalFormOpen] =
    useState(false);

  const [isDeleteAppModalFormOpen, setIsDeleteAppModalFormOpen] =
    useState(false);

  const [
    isCreateNewVersionFormSubmitDisabled,
    setIsCreateNewVersionFormSubmitDisabled,
  ] = useState(true);

  const createNewVersionFormId = useId();
  const permissionsFormId = useId();
  const [isPermissionsFormSubmitDisabled, setIsPermissionsFormSubmitDisabled] =
    useState(true);
  useSaveShortcut(
    isPermissionsModalOpen ? permissionsFormId : createNewVersionFormId,
    isPermissionsModalOpen
      ? isPermissionsFormSubmitDisabled
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
            icon: <PiDatabase />,
            label: intl.formatMessage({ defaultMessage: "Persistent state" }),
            onPress: () => setIsStateModalOpen(true),
          },
          {
            icon: <PiShieldCheck />,
            label: intl.formatMessage({ defaultMessage: "Permissions" }),
            onPress: () => setIsPermissionsModalOpen(true),
          },
          {
            icon: <PiPencilSimple />,
            label: intl.formatMessage({ defaultMessage: "Edit name" }),
            onPress: () => setIsUpdateNameModalFormOpen(true),
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
          isStateModalOpen={isStateModalOpen}
          onStateModalClose={() => setIsStateModalOpen(false)}
          onStateModalOpen={() => setIsStateModalOpen(true)}
          app={app}
          formId={createNewVersionFormId}
          setSubmitDisabled={setIsCreateNewVersionFormSubmitDisabled}
        />
        {isPermissionsModalOpen ? (
          <UpdatePermissionsModalForm
            app={app}
            formId={permissionsFormId}
            setSubmitDisabled={setIsPermissionsFormSubmitDisabled}
            onClose={() => setIsPermissionsModalOpen(false)}
          />
        ) : null}
        <UpdateNameModalForm
          app={app}
          isOpen={isUpdateNameModalFormOpen}
          onClose={() => setIsUpdateNameModalFormOpen(false)}
        />
        <DeleteAppModalForm
          app={app}
          isOpen={isDeleteAppModalFormOpen}
          onClose={() => setIsDeleteAppModalFormOpen(false)}
        />
      </Shell.Panel.Content>
    </Shell.Panel>
  ) : null;
}
