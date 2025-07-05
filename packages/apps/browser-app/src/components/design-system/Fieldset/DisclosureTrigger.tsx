import { type ReactNode, useRef } from "react";
import { mergeProps, useButton, useFocusRing } from "react-aria";
import { PiCaretDown, PiCaretRight } from "react-icons/pi";
import { useDisclosure } from "./disclosure.js";
import * as cs from "./Fieldset.css.js";

interface Props {
  children: ReactNode;
}
export default function DisclosureTrigger({ children }: Props) {
  const { triggerProps, isDisclosureDisabled } = useDisclosure();
  const disclosureTriggerRef = useRef<HTMLSpanElement | null>(null);
  const { buttonProps } = useButton(
    { ...triggerProps, elementType: "span", isDisabled: isDisclosureDisabled },
    disclosureTriggerRef,
  );
  const { focusProps } = useFocusRing();
  return (
    <span
      ref={disclosureTriggerRef}
      {...mergeProps(buttonProps, focusProps)}
      className={cs.DisclosureTrigger.root}
    >
      {!isDisclosureDisabled ? (
        triggerProps["aria-expanded"] ? (
          <PiCaretDown className={cs.DisclosureTrigger.indicator} />
        ) : (
          <PiCaretRight className={cs.DisclosureTrigger.indicator} />
        )
      ) : null}
      {children}
    </span>
  );
}
