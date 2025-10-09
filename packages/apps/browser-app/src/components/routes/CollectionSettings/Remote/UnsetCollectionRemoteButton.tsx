import type { Collection } from "@superego/backend";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import Button from "../../../design-system/Button/Button.jsx";
import * as cs from "../CollectionSettings.css.js";
import UnsetCollectionRemoteModalForm from "./UnsetCollectionRemoteModalForm.jsx";

interface Props {
  collection: Collection;
}
export default function UnsetCollectionRemoteButton({ collection }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return CollectionUtils.hasRemote(collection) ? (
    <>
      <Button
        variant="danger"
        onPress={() => setIsModalOpen(true)}
        className={cs.UnsetCollectionRemoteButton.root}
      >
        <FormattedMessage defaultMessage="Unset remote" />
      </Button>
      <UnsetCollectionRemoteModalForm
        collection={collection}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  ) : null;
}
