import {
  type DetailedHTMLProps,
  type FieldsetHTMLAttributes,
  useRef,
} from "react";
import { useDisclosure } from "react-aria";
import { useDisclosureState } from "react-stately";
import classnames from "../../../utils/classnames.js";
import { DisclosureProvider } from "./disclosure.js";
import Fields from "./Fields.js";
import * as cs from "./Fieldset.css.js";
import Legend from "./Legend.js";

interface Props {
  isDisclosureDisabled?: boolean | undefined;
  defaultExpanded?: boolean | undefined;
}
export default function Fieldset({
  isDisclosureDisabled = false,
  defaultExpanded = true,
  className,
  ...props
}: Props &
  DetailedHTMLProps<
    FieldsetHTMLAttributes<HTMLFieldSetElement>,
    HTMLFieldSetElement
  >) {
  const disclosureState = useDisclosureState({ defaultExpanded });
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { buttonProps: triggerProps, panelProps } = useDisclosure(
    { defaultExpanded },
    disclosureState,
    panelRef,
  );
  return (
    <DisclosureProvider
      value={{ triggerProps, panelRef, panelProps, isDisclosureDisabled }}
    >
      <fieldset
        {...props}
        className={classnames(cs.Fieldset.root, className)}
      />
    </DisclosureProvider>
  );
}

Fieldset.Legend = Legend;
Fieldset.Fields = Fields;
