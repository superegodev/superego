import type { PackId } from "@superego/backend";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { getBazaarPackQuery } from "../../../business-logic/backend/hooks.js";
import { PackSource } from "../../../business-logic/navigation/Route.js";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.js";
import PackMainPanel from "./PackMainPanel.js";

interface Props {
  packId: PackId;
}
export default function BazaarPack({ packId }: Props) {
  const intl = useIntl();
  return (
    <DataLoader
      queries={[getBazaarPackQuery([packId])]}
      renderErrors={(errors) => (
        <RouteLevelErrors
          headerTitle={intl.formatMessage(
            { defaultMessage: "Bazaar » {packId}" },
            { packId },
          )}
          errors={errors}
        />
      )}
    >
      {(pack) => <PackMainPanel pack={pack} source={PackSource.Bazaar} />}
    </DataLoader>
  );
}
