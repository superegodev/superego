import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { listBazaarPacksQuery } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import PackCard from "../../design-system/PackCard/PackCard.jsx";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.jsx";
import Shell from "../../design-system/Shell/Shell.jsx";
import * as cs from "./Bazaar.css.js";

export default function Bazaar() {
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
            <div className={cs.Bazaar.grid}>
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
