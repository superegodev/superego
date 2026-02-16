import type { DetailedHTMLProps, HTMLAttributes } from "react";
import classnames from "../../../utils/classnames.js";
import FormsFields from "../forms/Fields.js";
import { useDisclosure } from "./disclosure.js";
import * as cs from "./Fieldset.css.js";

interface Props {
  className?: string | undefined;
}
export default function Fields({
  className,
  ...props
}: Props & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  const { panelRef, panelProps } = useDisclosure();
  return (
    <FormsFields
      {...props}
      {...panelProps}
      ref={panelRef}
      className={classnames(cs.Fields.root, className)}
    />
  );
}
