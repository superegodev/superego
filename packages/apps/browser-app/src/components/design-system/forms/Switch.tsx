import type { ReactNode, RefAttributes } from "react";
import { type SwitchProps, Switch as SwitchRAC } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props extends SwitchProps {
  className?: string | undefined;
  children?: ReactNode;
}
export default function Switch({
  className,
  ...props
}: Props & RefAttributes<HTMLLabelElement>) {
  return (
    <SwitchRAC {...props} className={classnames(cs.Switch.root, className)}>
      <div className={cs.Switch.track}>
        <div className={cs.Switch.thumb} />
      </div>
      {props.children}
    </SwitchRAC>
  );
}
