import { Label, ProgressBar as ProgressBarRAC } from "react-aria-components";
import * as cs from "./ProgressBar.css.js";

interface Props {
  value: number;
  maxValue: number;
  label: string;
}

export default function ProgressBar({ value, maxValue, label }: Props) {
  const percentage = Math.round((value / maxValue) * 100);

  return (
    <ProgressBarRAC
      value={value}
      maxValue={maxValue}
      className={cs.ProgressBar.root}
    >
      <div className={cs.ProgressBar.header}>
        <Label className={cs.ProgressBar.label}>{label}</Label>
        <span className={cs.ProgressBar.percentage}>{percentage}%</span>
      </div>
      <div className={cs.ProgressBar.track}>
        <div
          className={cs.ProgressBar.fill}
          style={
            {
              "--progress-bar-percentage": `${(value / maxValue) * 100}%`,
            } as React.CSSProperties
          }
        />
      </div>
    </ProgressBarRAC>
  );
}
