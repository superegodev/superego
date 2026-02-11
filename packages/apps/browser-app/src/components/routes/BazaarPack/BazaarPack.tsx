import type { PackId } from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { useState } from "react";
import { PiEye, PiEyeFill } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { getBazaarPackQuery } from "../../../business-logic/backend/hooks.js";
import classnames from "../../../utils/classnames.js";
import isEmpty from "../../../utils/isEmpty.js";
import Button from "../../design-system/Button/Button.js";
import Carousel from "../../design-system/Carousel/Carousel.js";
import CollectionPreviewsTabs from "../../design-system/CollectionPreviewsTabs/CollectionPreviewsTabs.js";
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
  const [isCollectionsOpen, setCollectionsOpen] = useState(false);
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
      {(pack) => {
        const collectionPreviews = pack.collections.map((collection, index) => {
          const protoCollectionId = Id.generate.protoCollection(index);
          const exampleDocument = pack.documents.find(
            (document) => document.collectionId === protoCollectionId,
          )?.content;
          return {
            settings: {
              name: collection.settings.name,
              icon: collection.settings.icon,
            },
            schema: collection.schema,
            exampleDocument,
          };
        });
        const isShowingCollections =
          isCollectionsOpen && collectionPreviews.length > 0;

        return (
          <Shell.Panel slot="Main">
            <Shell.Panel.Header
              title={intl.formatMessage(
                { defaultMessage: "Bazaar » {packName}" },
                { packName: pack.info.name },
              )}
              actions={[
                !isEmpty(collectionPreviews)
                  ? {
                      label: intl.formatMessage({
                        defaultMessage: "Toggle collections preview",
                      }),
                      icon: isShowingCollections ? <PiEyeFill /> : <PiEye />,
                      onPress: () => setCollectionsOpen(!isCollectionsOpen),
                    }
                  : null,
              ]}
            />
            <Shell.Panel.Content
              fullWidth={isShowingCollections}
              className={classnames(
                cs.BazaarPack.root,
                isShowingCollections
                  ? cs.BazaarPack.collectionsLayout
                  : undefined,
              )}
            >
              <div
                className={classnames(
                  cs.BazaarPack.contentWrapper,
                  isShowingCollections
                    ? cs.BazaarPack.contentWrapperCollectionsLayout
                    : undefined,
                )}
              >
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
                    onPress={() => setInstallModalOpen(true)}
                  >
                    <FormattedMessage defaultMessage="Install" />
                  </Button>
                </div>
              </div>
              {isShowingCollections ? (
                <aside className={cs.BazaarPack.collections}>
                  <CollectionPreviewsTabs collections={collectionPreviews} />
                </aside>
              ) : null}
              <InstallPackModal
                pack={pack}
                isOpen={isInstallModalOpen}
                onClose={() => setInstallModalOpen(false)}
              />
            </Shell.Panel.Content>
          </Shell.Panel>
        );
      }}
    </DataLoader>
  );
}
