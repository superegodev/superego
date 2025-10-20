import type { AppId } from "@superego/backend";
import { useId, useState } from "react";
import { PiFloppyDisk, PiPencilSimple } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import AppUtils from "../../../utils/AppUtils.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import Shell from "../../design-system/Shell/Shell.js";
import CreateNewAppVersionForm from "./CreateNewAppVersionForm.jsx";
import UpdateNameModalForm from "./UpdateNameModalForm.jsx";

interface Props {
  appId: AppId;
}
export default function CreateNewAppVersion({ appId }: Props) {
  const intl = useIntl();
  const { apps, collections } = useGlobalData();

  const [isUpdateNameModalFormOpen, setIsUpdateNameModalFormOpen] =
    useState(false);

  const [
    isCreateNewVersionFormSubmitDisabled,
    setIsCreateNewVersionFormSubmitDisabled,
  ] = useState(true);

  const formId = useId();

  const app = AppUtils.findApp(apps, appId);
  return app ? (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage(
          { defaultMessage: "🧩\u2002{app} » Create New Version" },
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
        ]}
      />
      <Shell.Panel.Content fullWidth={true}>
        <CreateNewAppVersionForm
          app={app}
          targetCollections={CollectionUtils.findAllCollections(
            collections,
            app.latestVersion.targetCollections.map(({ id }) => id),
          )}
          formId={formId}
          setSubmitDisabled={setIsCreateNewVersionFormSubmitDisabled}
        />
        <UpdateNameModalForm
          app={app}
          isOpen={isUpdateNameModalFormOpen}
          onClose={() => setIsUpdateNameModalFormOpen(false)}
        />
      </Shell.Panel.Content>
    </Shell.Panel>
  ) : null;
}
