import type { ToolResult } from "@superego/backend";
import type { EChartsOption } from "echarts";
import { omit } from "es-toolkit";
import { lazy, Suspense, useMemo } from "react";
import { vars } from "../../../../themes.css.js";
import Skeleton from "../../../design-system/Skeleton/Skeleton.js";
import Title from "./Title.js";
import * as cs from "./ToolResult.css.js";

const Echart = lazy(() => import("../../../design-system/Echart/Echart.js"));

interface Props {
  toolResult: ToolResult.RenderChart & {
    output: { success: true };
  };
}
export default function RenderChart({ toolResult }: Props) {
  const { echartsOption } = toolResult.artifacts!;
  const { title } = echartsOption;

  // echartsOption actual value (not ref) only changes when toolCallId changes.
  // Since we don't want to redraw the chart on every change of ref, we memoize
  // the option.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  const option = useMemo(
    () => omit(echartsOption as EChartsOption, ["title", "toolbox"]),
    [toolResult.toolCallId],
  );

  return (
    <div>
      <Title>{Array.isArray(title) ? title[0].text : title.text}</Title>
      <Suspense
        fallback={
          <Skeleton
            variant="rectangle"
            width="100%"
            height={vars.spacing._80}
          />
        }
      >
        <Echart
          option={option}
          width="100%"
          height={vars.spacing._80}
          className={cs.RenderChart.chart}
        />
      </Suspense>
    </div>
  );
}
