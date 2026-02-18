import type { PackId } from "@superego/backend";
import { useIntl } from "react-intl";
import { PackSource } from "../../../business-logic/navigation/Route.js";
import usePackStore from "../../../business-logic/packs/usePackStore.js";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.js";
import PackMainPanel from "./PackMainPanel.js";

interface Props {
  packId: PackId;
}
export default function LocalPack({ packId }: Props) {
  const intl = useIntl();
  const { getPack } = usePackStore();
  const pack = getPack(packId);

  if (!pack) {
    return (
      <RouteLevelErrors
        headerTitle={intl.formatMessage(
          { defaultMessage: "Custom Packs » {packId}" },
          { packId },
        )}
        errors={[{ name: "PackNotFound", details: null }]}
      />
    );
  }

  return <PackMainPanel pack={pack} source={PackSource.Local} />;
}
