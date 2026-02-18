import type { Pack as PackType } from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { useState } from "react";
import { PiEye, PiEyeFill } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import { PackSource } from "../../../business-logic/navigation/Route.js";
import classnames from "../../../utils/classnames.js";
import isEmpty from "../../../utils/isEmpty.js";
import Button from "../../design-system/Button/Button.js";
import Carousel from "../../design-system/Carousel/Carousel.js";
import CollectionPreviewsTabs from "../../design-system/CollectionPreviewsTabs/CollectionPreviewsTabs.js";
import Markdown from "../../design-system/Markdown/Markdown.js";
import PackName from "../../design-system/PackName/PackName.js";
import Shell from "../../design-system/Shell/Shell.js";
import InstallPackModal from "./InstallPackModal.js";
import * as cs from "./Pack.css.js";
import PackEntityCounts from "./PackEntityCounts.js";

interface Props {
  pack: PackType;
  source: PackSource;
}
export default function PackMainPanel({ pack, source }: Props) {
  const intl = useIntl();
  const [isInstallModalOpen, setInstallModalOpen] = useState(false);
  const [isCollectionsOpen, setCollectionsOpen] = useState(false);

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

  const title =
    source === PackSource.Bazaar
      ? intl.formatMessage(
          { defaultMessage: "Bazaar » {packName}" },
          { packName: pack.info.name },
        )
      : intl.formatMessage(
          { defaultMessage: "Custom Packs » {packName}" },
          { packName: pack.info.name },
        );

  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={title}
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
          cs.PackMainPanel.root,
          isShowingCollections ? cs.PackMainPanel.collectionsLayout : undefined,
        )}
      >
        <div
          className={classnames(
            cs.PackMainPanel.contentWrapper,
            isShowingCollections
              ? cs.PackMainPanel.contentWrapperCollectionsLayout
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
          <div className={cs.PackMainPanel.titleContainer}>
            <h1 className={cs.PackMainPanel.name}>
              <PackName pack={pack} />
            </h1>
            <p className={cs.PackMainPanel.counts}>
              <PackEntityCounts pack={pack} separator=" · " />
            </p>
          </div>
          <Markdown
            text={pack.info.longDescription}
            className={cs.PackMainPanel.longDescription}
          />
          <div className={cs.PackMainPanel.installButtonContainer}>
            <Button variant="primary" onPress={() => setInstallModalOpen(true)}>
              <FormattedMessage defaultMessage="Install" />
            </Button>
          </div>
        </div>
        {isShowingCollections ? (
          <aside className={cs.PackMainPanel.collections}>
            <CollectionPreviewsTabs collections={collectionPreviews} />
          </aside>
        ) : null}
        <InstallPackModal
          pack={pack}
          source={source}
          isOpen={isInstallModalOpen}
          onClose={() => setInstallModalOpen(false)}
        />
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}
