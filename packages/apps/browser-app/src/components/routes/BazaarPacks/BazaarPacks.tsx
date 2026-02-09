import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { listBazaarPacksQuery } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import PackCard from "../../design-system/PackCard/PackCard.js";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.js";
import Shell from "../../design-system/Shell/Shell.js";
import * as cs from "./BazaarPacks.css.js";

export default function BazaarPacks() {
  const intl = useIntl();
  const title = intl.formatMessage({ defaultMessage: "Bazaar" });
  return (
    <DataLoader
      queries={[listBazaarPacksQuery([])]}
      renderErrors={(errors) => (
        <RouteLevelErrors headerTitle={title} errors={errors} />
      )}
    >
      {(packs) => (
        <Shell.Panel slot="Main">
          <Shell.Panel.Header title={title} />
          <Shell.Panel.Content fullWidth={true}>
            {/* TODO_BAZAAR: short paragraph saying what the bazaar is */}
            <div className={cs.BazaarPacks.grid}>
              {packs.map((pack) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  to={{ name: RouteName.BazaarPack, packId: pack.id }}
                />
              ))}
            </div>
          </Shell.Panel.Content>
        </Shell.Panel>
      )}
    </DataLoader>
  );
}
