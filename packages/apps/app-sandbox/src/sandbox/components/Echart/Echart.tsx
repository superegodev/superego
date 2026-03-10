import { lazy, Suspense } from "react";
import Skeleton from "../Skeleton/Skeleton.js";
import type Props from "./Props.js";

const EagerEchart = lazy(() => import("./EagerEchart.js"));

export default function Echart(props: Props) {
  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangle"
          width={props.width}
          height={props.height}
        />
      }
    >
      <EagerEchart {...props} />
    </Suspense>
  );
}
