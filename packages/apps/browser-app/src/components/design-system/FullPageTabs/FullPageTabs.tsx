import { type ReactNode, useId } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import type Route from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import * as cs from "./FullPageTabs.css.js";

interface Props {
  tabs: (
    | { title: ReactNode; panel: ReactNode }
    | { title: ReactNode; to: Route }
  )[];
}
export default function FullPageTabs({ tabs }: Props) {
  const tabsId = useId();
  return (
    <Tabs>
      <TabList className={cs.FullPageTabs.tabList}>
        {tabs.map((tab, index) => (
          <Tab
            // biome-ignore lint/suspicious/noArrayIndexKey: tabs is stable.
            key={index}
            id={`${tabsId}-${index}`}
            className={cs.FullPageTabs.tab}
            href={"to" in tab ? toHref(tab.to) : undefined}
          >
            {tab.title}
          </Tab>
        ))}
      </TabList>
      {tabs
        .filter((tab) => "panel" in tab)
        .map((tab, index) => (
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
