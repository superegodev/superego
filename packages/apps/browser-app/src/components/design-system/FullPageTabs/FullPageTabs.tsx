import { type ReactNode, useId } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import type Route from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import * as cs from "./FullPageTabs.css.js";

interface Props {
  tabs: (
    | ({ title: ReactNode; isDisabled?: boolean | undefined } & (
        | { panel: ReactNode }
        | { to: Route }
      ))
    | null
  )[];
}
export default function FullPageTabs({ tabs }: Props) {
  const tabsId = useId();
  return (
    <Tabs>
      <TabList className={cs.FullPageTabs.tabList}>
        {tabs
          .filter((tab) => tab !== null)
          .map((tab, index) => (
            <Tab
              // biome-ignore lint/suspicious/noArrayIndexKey: tabs is stable.
              key={index}
              id={`${tabsId}-${index}`}
              className={cs.FullPageTabs.tab}
              href={"to" in tab ? toHref(tab.to) : undefined}
              isDisabled={tab.isDisabled}
            >
              {tab.title}
            </Tab>
          ))}
      </TabList>
      {tabs
        .filter((tab) => tab !== null && "panel" in tab)
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
