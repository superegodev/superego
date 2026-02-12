import { Id } from "@superego/shared-utils";
import { useId } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import type { UiOptions } from "../../widgets/RHFContentField/uiOptions.js";
import CollectionPreview from "./CollectionPreview.js";
import * as cs from "./CollectionPreviewsTabs.css.js";
import type CollectionPreviewsTabsItem from "./CollectionPreviewsTabsItem.js";

interface Props {
  collections: CollectionPreviewsTabsItem[];
  className?: string | undefined;
  tabClassName?: string | undefined;
}
export default function CollectionPreviewsTabs({
  collections,
  className,
  tabClassName,
}: Props) {
  const tabsId = useId();
  const protoCollections: UiOptions["protoCollections"] = collections.map(
    (collection, index) => ({
      id: Id.generate.protoCollection(index),
      settings: {
        name: collection.settings.name,
        icon: collection.settings.icon,
      },
    }),
  );
  return (
    <div className={classnames(cs.CollectionPreviewsTabs.root, className)}>
      <Tabs className={cs.CollectionPreviewsTabs.tabs}>
        <TabList className={cs.CollectionPreviewsTabs.tabList}>
          {collections.map((collection, index) => (
            <Tab
              key={Id.generate.protoCollection(index)}
              id={`${tabsId}-${index}`}
              className={classnames(
                cs.CollectionPreviewsTabs.tab,
                tabClassName,
              )}
            >
              {collection.settings.icon} {collection.settings.name}
            </Tab>
          ))}
        </TabList>
        {collections.map((collection, index) => (
          <TabPanel
            key={Id.generate.protoCollection(index)}
            id={`${tabsId}-${index}`}
            className={cs.CollectionPreviewsTabs.tabPanel}
          >
            <CollectionPreview
              collection={collection}
              protoCollections={protoCollections}
            />
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
}
