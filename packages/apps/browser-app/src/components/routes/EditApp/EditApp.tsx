import type { AppId } from "@superego/backend";
import { useId, useMemo, useState } from "react";
import { PiFloppyDisk, PiPencilSimple, PiTrash } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { useUpdateAppSettings } from "../../../business-logic/backend/hooks.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toasts from "../../../business-logic/toasts/toasts.js";
import AppUtils from "../../../utils/AppUtils.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import { Switch } from "../../design-system/forms/forms.js";
import Shell from "../../design-system/Shell/Shell.js";
import CreateNewAppVersionForm from "./CreateNewAppVersionForm.js";
import DeleteAppModalForm from "./DeleteAppModalForm.js";
import * as cs from "./EditApp.css.js";
import UpdateNameModalForm from "./UpdateNameModalForm.js";

interface Props {
  appId: AppId;
}
export default function EditApp({ appId }: Props) {
  const intl = useIntl();
  const { apps, collections } = useGlobalData();

  const [isUpdateNameModalFormOpen, setIsUpdateNameModalFormOpen] =
    useState(false);

  const [isDeleteAppModalFormOpen, setIsDeleteAppModalFormOpen] =
    useState(false);

  const [
    isCreateNewVersionFormSubmitDisabled,
    setIsCreateNewVersionFormSubmitDisabled,
  ] = useState(true);

  const formId = useId();

  const { mutate: updateSettings } = useUpdateAppSettings();

  const app = AppUtils.findApp(apps, appId);
  const targetCollections = useMemo(
    () =>
      app
        ? CollectionUtils.findAllCollections(
            collections,
            app.latestVersion.targetCollections.map(({ id }) => id),
          )
        : null,
    [collections, app],
  );

  return app && targetCollections ? (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage(
          { defaultMessage: "🧩\u2002{app} » Edit" },
          { app: app.name },
        )}
        actions={[
          {
            icon: <PiPencilSimple />,
            label: intl.formatMessage({ defaultMessage: "Edit name" }),
            onPress: () => setIsUpdateNameModalFormOpen(true),
          },
          {
            icon: <PiFloppyDisk />,
            label: intl.formatMessage({ defaultMessage: "Create new version" }),
            submit: formId,
            isDisabled: isCreateNewVersionFormSubmitDisabled,
          },
          {
            icon: <PiTrash />,
            label: intl.formatMessage({ defaultMessage: "Delete" }),
            onPress: () => setIsDeleteAppModalFormOpen(true),
          },
        ]}
      />
      <Shell.Panel.Content fullWidth={true} className={cs.EditApp.panelContent}>
        <Switch
          isSelected={app.settings.alwaysCollapsePrimarySidebar}
          onChange={async (isSelected: boolean) => {
            const { success, error } = await updateSettings(app.id, {
              alwaysCollapsePrimarySidebar: isSelected,
            });
            if (!success) {
              console.error(error);
              toasts.add({
                type: ToastType.Error,
                title: intl.formatMessage({
                  defaultMessage: "Error updating app settings",
                }),
                error: error,
              });
            }
          }}
        >
          <FormattedMessage defaultMessage="Always collapse sidebar" />
        </Switch>
        <CreateNewAppVersionForm
          app={app}
          targetCollections={targetCollections}
          formId={formId}
          setSubmitDisabled={setIsCreateNewVersionFormSubmitDisabled}
        />
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
