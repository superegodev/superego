import type { ReactNode } from "react";
import { Toolbar } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import Fieldset from "../Fieldset/Fieldset.js";
import { Label } from "../forms/forms.js";
import Action from "./Action.js";
import * as cs from "./FieldLabel.css.js";

interface Props {
  actions?: ReactNode | undefined;
  component?: "label" | "legend" | undefined;
  htmlFor?: string | undefined;
  className?: string | undefined;
  children: ReactNode;
}
export default function FieldLabel({
  actions,
  component = "label",
  htmlFor,
  className,
  children,
}: Props) {
  const actionsToolbar = actions ? (
    <Toolbar className={cs.FieldLabel.actions}>{actions}</Toolbar>
  ) : null;
  return component === "label" ? (
    <Label
      htmlFor={htmlFor}
      className={classnames(cs.FieldLabel.root, className)}
    >
      <span>{children}</span>
      {actionsToolbar}
    </Label>
  ) : (
    <Fieldset.Legend
      className={classnames(cs.FieldLabel.root, className)}
      nonDisclosureTriggeringChildren={actionsToolbar}
    >
      {children}
    </Fieldset.Legend>
  );
}

FieldLabel.Action = Action;
