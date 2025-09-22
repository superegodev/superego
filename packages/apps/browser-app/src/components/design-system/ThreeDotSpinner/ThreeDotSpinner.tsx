import classnames from "../../../utils/classnames.js";
import * as cs from "./ThreeDotSpinner.css.js";

interface Props {
  className?: string | undefined;
}
export default function ThreeDotSpinner({ className }: Props) {
  return (
    <div className={classnames(cs.ThreeDotSpinner.root, className)}>
      <div className={cs.ThreeDotSpinner.dot} />
      <div
        className={classnames(
          cs.ThreeDotSpinner.dot,
          cs.ThreeDotSpinner.dotDelayTwo,
        )}
      />
      <div
        className={classnames(
          cs.ThreeDotSpinner.dot,
          cs.ThreeDotSpinner.dotDelayThree,
        )}
      />
    </div>
  );
}
