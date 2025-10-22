import type { CollectionId } from "@superego/backend";
import { useMemo, useState } from "react";
import { PiFloppyDisk } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import Shell from "../../design-system/Shell/Shell.js";
import * as cs from "./CreateApp.css.js";
import CreateAppForm from "./CreateAppForm.js";

interface Props {
  collectionIds: CollectionId[];
}
export default function CreateApp({ collectionIds }: Props) {
  const intl = useIntl();

  const [isSetNameAndSaveModalOpen, setIsSetNameAndSaveModalOpen] =
    useState(false);

  const { collections } = useGlobalData();
  const targetCollection = useMemo(
    () => CollectionUtils.findAllCollections(collections, collectionIds),
    [collections, collectionIds],
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
      <Shell.Panel.Content
        fullWidth={true}
        className={cs.CreateApp.panelContent}
      >
        <CreateAppForm
          targetCollections={targetCollection}
          isSetNameAndSaveModalOpen={isSetNameAndSaveModalOpen}
          onSetNameAndSaveModalClose={() => setIsSetNameAndSaveModalOpen(false)}
        />
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}
