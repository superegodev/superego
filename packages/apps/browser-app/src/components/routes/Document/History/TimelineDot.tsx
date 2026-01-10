import * as cs from "./History.css.js";

interface Props {
  showDot?: boolean;
  position: "first" | "middle" | "last" | "only";
}
export default function TimelineDot({ showDot = true, position }: Props) {
  return (
    <div className={cs.TimelineDot.root}>
      <div className={cs.TimelineDot.line} data-position={position} />
      {showDot ? <div className={cs.TimelineDot.dot} /> : null}
    </div>
  );
}
