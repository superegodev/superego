import type { ToolResult } from "@superego/backend";
import { lazy, Suspense, useMemo } from "react";
import { vars } from "../../../../themes.css.js";
import Skeleton from "../../../design-system/Skeleton/Skeleton.jsx";
import Title from "./Title.js";
import * as cs from "./ToolResult.css.js";

const Echart = lazy(() => import("../../../design-system/Echart/Echart.js"));

interface Props {
  toolResult: ToolResult.RenderChart & {
    output: { success: true };
  };
}
export default function RenderChart({ toolResult }: Props) {
  const { title, ...optionWithoutTitle } = toolResult.artifacts!.echartsOption;

  // echartsOption actual value (not ref) only changes when toolCallId changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  const option = useMemo(() => optionWithoutTitle, [toolResult.toolCallId]);

  return (
    <div className={cs.RenderChart.root}>
      <Title>{title.text}</Title>
      <Suspense
        fallback={
          <Skeleton
            variant="rectangle"
            width="100%"
            height={vars.spacing._80}
          />
        }
      >
        <Echart option={option} width="100%" height={vars.spacing._80} />
      </Suspense>
    </div>
  );
}
