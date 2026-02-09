import type { Pack } from "@superego/backend";
import { FormattedMessage } from "react-intl";
import { useInstallPack } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import Button from "../../design-system/Button/Button.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import PackEntityCounts from "./PackEntityCounts.js";

interface Props {
  pack: Pack;
  isOpen: boolean;
  onClose: () => void;
}
export default function InstallPackModal({ pack, isOpen, onClose }: Props) {
  const { navigateTo } = useNavigationState();
  const { mutate, result, isPending } = useInstallPack();

  const onInstall = async () => {
    const { success, data } = await mutate(pack);
    if (success) {
      onClose();
      const [firstCollection] = data.collections;
      navigateTo(
        firstCollection
          ? { name: RouteName.Collection, collectionId: firstCollection.id }
          : { name: RouteName.Ask },
      );
    }
  };

  return (
    <ModalDialog
      isDismissable={!isPending}
      isOpen={isOpen}
      onOpenChange={onClose}
    >
      <ModalDialog.Heading>
        <FormattedMessage
          defaultMessage='Install "{packName}"?'
          values={{ packName: pack.info.name }}
        />
      </ModalDialog.Heading>
      <p>
        <PackEntityCounts pack={pack} separator=", " />{" "}
        <FormattedMessage defaultMessage="will be installed." />
      </p>
      <ModalDialog.Actions>
        <Button onPress={onClose} isDisabled={isPending}>
          <FormattedMessage defaultMessage="Cancel" />
        </Button>
        <Button variant="primary" onPress={onInstall} isDisabled={isPending}>
          <FormattedMessage defaultMessage="Install" />
        </Button>
      </ModalDialog.Actions>
      {result?.error ? <ResultErrors errors={[result.error]} /> : null}
    </ModalDialog>
  );
}
