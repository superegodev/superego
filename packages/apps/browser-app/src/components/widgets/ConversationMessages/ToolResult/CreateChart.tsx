import type { ToolResult } from "@superego/backend";
import type { EChartsOption } from "echarts";
import { omit } from "es-toolkit";
import { useMemo } from "react";
import { vars } from "../../../../themes.css.js";
import Echart from "../../../design-system/Echart/Echart.js";
import Title from "./Title.js";
import * as cs from "./ToolResult.css.js";

interface Props {
  toolResult: ToolResult.CreateChart & {
    output: { success: true };
    artifacts: NonNullable<ToolResult.CreateChart["artifacts"]>;
  };
}
export default function CreateChart({ toolResult }: Props) {
  const { echartsOption } = toolResult.artifacts;
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
      <Echart
        option={option}
        width="100%"
        height={vars.spacing._80}
        className={cs.CreateChart.chart}
      />
    </div>
  );
}
