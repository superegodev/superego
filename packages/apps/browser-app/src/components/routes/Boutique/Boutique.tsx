import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { listBoutiquePacksQuery } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import PackCard from "../../design-system/PackCard/PackCard.js";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.js";
import Shell from "../../design-system/Shell/Shell.js";
import * as cs from "./Boutique.css.js";
import Explainer from "./Explainer.js";

export default function Boutique() {
  const intl = useIntl();
  const title = intl.formatMessage({ defaultMessage: "Boutique" });

  return (
    <DataLoader
      queries={[listBoutiquePacksQuery([])]}
      renderErrors={(errors) => (
        <RouteLevelErrors headerTitle={title} errors={errors} />
      )}
    >
      {(packs) => (
        <Shell.Panel slot="Main">
          <Shell.Panel.Header title={title} />
          <Shell.Panel.Content fullWidth={true}>
            <Explainer />

            <div className={cs.Boutique.grid}>
              {packs.map((pack) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  to={{
                    name: RouteName.Pack,
                    packId: pack.id,
                  }}
                />
              ))}
            </div>
          </Shell.Panel.Content>
        </Shell.Panel>
      )}
    </DataLoader>
  );
}
