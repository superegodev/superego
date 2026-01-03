import type { CSSProperties } from "react";
import { Label, ProgressBar as ProgressBarRAC } from "react-aria-components";
import * as cs from "./ProgressBar.css.js";

interface Props {
  value: number;
  maxValue: number;
  label: string;
}

export default function ProgressBar({ value, maxValue, label }: Props) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <ProgressBarRAC
      value={value}
      maxValue={maxValue}
      className={cs.ProgressBar.root}
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
