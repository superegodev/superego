import type { PackId } from "@superego/backend";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { getBoutiquePackQuery } from "../../../business-logic/backend/hooks.js";
import { PackSource } from "../../../business-logic/navigation/Route.js";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.js";
import PackMainPanel from "./PackMainPanel.js";

interface Props {
  packId: PackId;
}
export default function BoutiquePack({ packId }: Props) {
  const intl = useIntl();
  return (
    <DataLoader
      queries={[getBoutiquePackQuery([packId])]}
      renderErrors={(errors) => (
        <RouteLevelErrors
          headerTitle={intl.formatMessage(
            { defaultMessage: "Boutique » {packId}" },
            { packId },
          )}
          errors={errors}
        />
      )}
    >
      {(pack) => <PackMainPanel pack={pack} source={PackSource.Boutique} />}
    </DataLoader>
  );
}
