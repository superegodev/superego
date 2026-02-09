import type { PackId } from "@superego/backend";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { getBazaarPackQuery } from "../../../business-logic/backend/hooks.js";
import Button from "../../design-system/Button/Button.js";
import Carousel from "../../design-system/Carousel/Carousel.js";
import Markdown from "../../design-system/Markdown/Markdown.js";
import PackName from "../../design-system/PackName/PackName.js";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.js";
import Shell from "../../design-system/Shell/Shell.js";
import * as cs from "./BazaarPack.css.js";
import InstallPackModal from "./InstallPackModal.js";
import PackEntityCounts from "./PackEntityCounts.js";

interface Props {
  packId: PackId;
}
export default function BazaarPack({ packId }: Props) {
  const intl = useIntl();
  const [isInstallModalOpen, setInstallModalOpen] = useState(false);
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
      {(pack) => (
        <Shell.Panel slot="Main">
          <Shell.Panel.Header
            title={intl.formatMessage(
              { defaultMessage: "Bazaar » {packName}" },
              { packName: pack.info.name },
            )}
          />
          <Shell.Panel.Content className={cs.BazaarPack.root}>
            <Carousel
              images={pack.info.screenshots}
              alt={intl.formatMessage(
                { defaultMessage: "Screenshot of {packName}" },
                { packName: pack.info.name },
              )}
            />
            <div className={cs.BazaarPack.titleContainer}>
              <h1 className={cs.BazaarPack.name}>
                <PackName pack={pack} />
              </h1>
              <p className={cs.BazaarPack.counts}>
                <PackEntityCounts pack={pack} separator=" · " />
              </p>
            </div>
            <Markdown
              text={pack.info.longDescription}
              className={cs.BazaarPack.longDescription}
            />
            <div className={cs.BazaarPack.installButtonContainer}>
              <Button
                variant="primary"
                className={cs.BazaarPack.installButton}
                onPress={() => setInstallModalOpen(true)}
              >
                <FormattedMessage defaultMessage="Install" />
              </Button>
            </div>
            <InstallPackModal
              pack={pack}
              isOpen={isInstallModalOpen}
              onClose={() => setInstallModalOpen(false)}
            />
          </Shell.Panel.Content>
        </Shell.Panel>
      )}
    </DataLoader>
  );
}
