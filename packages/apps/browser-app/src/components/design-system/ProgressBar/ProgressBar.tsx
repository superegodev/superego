import type { CSSProperties } from "react";
import { Label, ProgressBar as ProgressBarRAC } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./ProgressBar.css.js";

interface Props {
  value: number;
  maxValue: number;
  label: string;
  className?: string | undefined;
}

export default function ProgressBar({
  value,
  maxValue,
  label,
  className,
}: Props) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <ProgressBarRAC
      value={value}
      maxValue={maxValue}
      className={classnames(cs.ProgressBar.root, className)}
    >
      <div className={cs.ProgressBar.header}>
        <Label className={cs.ProgressBar.label}>{label}</Label>
        <span className={cs.ProgressBar.percentage}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div className={cs.ProgressBar.track}>
        <div
          className={cs.ProgressBar.fill}
          style={{ "--percentage": `${percentage}%` } as CSSProperties}
        />
      </div>
    </ProgressBarRAC>
  );
}
