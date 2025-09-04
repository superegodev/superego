import type { ReactNode } from "react";
import {
  DisclosurePanel,
  Disclosure as DisclosureRAC,
} from "react-aria-components";
import { PiCaretDown, PiCaretRight } from "react-icons/pi";
import classnames from "../../../utils/classnames.js";
import Button from "../Button/Button.js";
import * as cs from "./Disclosure.css.js";

interface Props {
  title: string;
  titleClassName?: string | undefined;
  panelClassName?: string | undefined;
  children: ReactNode;
}
export default function Disclosure({
  title,
  titleClassName,
  panelClassName,
  children,
}: Props) {
  return (
    <DisclosureRAC>
      {({ isExpanded }) => (
        <>
          <Button
            slot="trigger"
            variant="invisible"
            className={classnames(cs.Disclosure.trigger, titleClassName)}
          >
            {isExpanded ? <PiCaretDown /> : <PiCaretRight />}
            {title}
          </Button>
          <DisclosurePanel className={panelClassName}>
            {children}
          </DisclosurePanel>
        </>
      )}
    </DisclosureRAC>
  );
}
