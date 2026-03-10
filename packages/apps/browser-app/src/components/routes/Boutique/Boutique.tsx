import { decode } from "@msgpack/msgpack";
import type { Pack } from "@superego/backend";
import { DropZone } from "react-aria-components";
import { FormattedMessage, useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { listBoutiquePacksQuery } from "../../../business-logic/backend/hooks.js";
import {
  PackSource,
  RouteName,
} from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import usePackStore from "../../../business-logic/packs/usePackStore.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toasts from "../../../business-logic/toasts/toasts.js";
import PackCard from "../../design-system/PackCard/PackCard.js";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.js";
import Shell from "../../design-system/Shell/Shell.js";
import * as cs from "./Boutique.css.js";
import Explainer from "./Explainer.js";

export default function Boutique() {
  const intl = useIntl();
  const title = intl.formatMessage({ defaultMessage: "Boutique" });
  const { setPack } = usePackStore();
  const { navigateTo } = useNavigationState();

  const handleDrop = async ({ items }: { items: any[] }) => {
    const [item] = items;
    if (item && item.kind === "file") {
      try {
        const file = await item.getFile();
        const buffer = await file.arrayBuffer();
        const pack = decode(new Uint8Array(buffer)) as Pack;
        setPack(pack);
        navigateTo({
          name: RouteName.Pack,
          packId: pack.id,
          source: PackSource.Local,
        });
      } catch {
        toasts.add({
          type: ToastType.Error,
          title: intl.formatMessage({
            defaultMessage: "Failed to decode pack file",
          }),
          error: { name: "DecodeError", details: null },
        });
      }
    }
  };

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
          <DropZone onDrop={handleDrop} className={cs.Boutique.pageDropZone}>
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
                      source: PackSource.Boutique,
                    }}
                  />
                ))}
              </div>
              <h4 className={cs.Boutique.boutiqueHeading}>
                <FormattedMessage defaultMessage="Or install your own" />
              </h4>
              <div className={cs.Boutique.dropZoneHint}>
                <FormattedMessage
                  defaultMessage="Drop <packMpk>pack.mpk</packMpk> to install"
                  values={{
                    packMpk: (chunks) => (
                      <span className={cs.Boutique.packMpk}>{chunks}</span>
                    ),
                  }}
                />
              </div>
            </Shell.Panel.Content>
          </DropZone>
        </Shell.Panel>
      )}
    </DataLoader>
  );
}
