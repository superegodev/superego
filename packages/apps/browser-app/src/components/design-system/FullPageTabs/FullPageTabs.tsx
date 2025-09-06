import { type ReactNode, useId } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import * as cs from "./FullPageTabs.css.js";

interface Props {
  ariaLabel: string;
  tabs: {
    title: ReactNode;
    panel: ReactNode;
  }[];
}
export default function FullPageTabs({ ariaLabel, tabs }: Props) {
  const tabsId = useId();
  return (
    <Tabs>
      <TabList aria-label={ariaLabel} className={cs.FullPageTabs.tabList}>
        {tabs.map((tab, index) => (
          <Tab
            // biome-ignore lint/suspicious/noArrayIndexKey: tabs is stable.
            key={index}
            id={`${tabsId}-${index}`}
            className={cs.FullPageTabs.tab}
          >
            {tab.title}
          </Tab>
        ))}
      </TabList>
      {tabs.map((tab, index) => (
        <TabPanel
          // biome-ignore lint/suspicious/noArrayIndexKey: tabs is stable.
          key={index}
          id={`${tabsId}-${index}`}
          className={cs.FullPageTabs.tabPanel}
        >
          {tab.panel}
        </TabPanel>
      ))}
    </Tabs>
  );
}
