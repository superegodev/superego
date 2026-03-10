import type { ReactNode } from "react";
import { PiCheckCircleFill, PiCircle } from "react-icons/pi";
import * as cs from "./Ask.css.js";

export default function WelcomeStep(props: {
  completed: boolean;
  enabled: boolean;
  children: ReactNode;
}) {
  const variant = props.completed
    ? "completed"
    : props.enabled
      ? "enabled"
      : "disabled";
  return (
    <li className={cs.WelcomeStep.root[variant]}>
      {props.completed ? (
        <PiCheckCircleFill className={cs.WelcomeStep.icon} />
      ) : (
        <PiCircle className={cs.WelcomeStep.icon} />
      )}
      <span>{props.children}</span>
    </li>
  );
}
