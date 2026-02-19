import * as cs from "./Skeleton.css.js";

export interface Props {
  width?: string | undefined;
  height?: string | undefined;
}
export default function RectangleSkeleton({
  width = "100%",
  height = "100%",
}: Props) {
  return (
    <div className={cs.RectangleSkeleton.root} style={{ width, height }} />
  );
}
