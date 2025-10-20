import type { CollectionId } from "@superego/backend";
import { useState } from "react";
import { PiFloppyDisk } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import Shell from "../../design-system/Shell/Shell.js";
import CreateAppForm from "./CreateAppForm.jsx";

interface Props {
  collectionIds: CollectionId[];
}
export default function CreateApp({ collectionIds }: Props) {
  const intl = useIntl();

  const [isSetNameAndSaveModalOpen, setIsSetNameAndSaveModalOpen] =
    useState(false);

  const { collections } = useGlobalData();
  const targetCollections = collections.filter(({ id }) =>
    collectionIds.includes(id),
  );
  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage({ defaultMessage: "Create App" })}
        actions={[
          {
            label: intl.formatMessage({ defaultMessage: "Create" }),
            icon: <PiFloppyDisk />,
            onPress: () => setIsSetNameAndSaveModalOpen(true),
          },
        ]}
      />
      <Shell.Panel.Content fullWidth={true}>
        <CreateAppForm
          targetCollections={targetCollections}
          isSetNameAndSaveModalOpen={isSetNameAndSaveModalOpen}
          onSetNameAndSaveModalClose={() => setIsSetNameAndSaveModalOpen(false)}
        />
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}
