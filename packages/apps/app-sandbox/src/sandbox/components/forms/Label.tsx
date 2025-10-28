import type { ReactNode } from "react";
import { type LabelProps, Label as LabelRAC } from "react-aria-components";
import * as cs from "./forms.css.js";

interface Props extends LabelProps {
  children: ReactNode;
}
export default function Label({ children }: Props) {
  return <LabelRAC className={cs.Label.root}>{children}</LabelRAC>;
}
