import { lazy, Suspense } from "react";
import type { EChartsOption } from "echarts";

interface Props {
  option: EChartsOption;
  width: string;
  height: string;
}

const EagerEchart = lazy(() => import("./EagerEchart.js"));

export default function Echart(props: Props) {
  return (
    <Suspense>
      <EagerEchart {...props} />
    </Suspense>
  );
}
