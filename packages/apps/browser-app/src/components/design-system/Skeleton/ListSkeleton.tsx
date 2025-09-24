import { vars } from "../../../themes.css.js";
import * as cs from "./Skeleton.css.js";

export interface Props {
  itemCount?: number | undefined;
  itemHeight?: string | undefined;
  itemGap?: string | undefined;
}
export default function ListSkeleton({
  itemCount = 10,
  itemHeight = vars.spacing._6,
  itemGap = vars.spacing._3,
}: Props) {
  return (
    <div className={cs.ListSkeleton.root} style={{ gap: itemGap }}>
      {Array(itemCount)
        .fill(null)
        .map((_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: items identical.
            key={index}
            className={cs.ListSkeleton.item}
            style={{ height: itemHeight }}
          />
        ))}
    </div>
  );
}
