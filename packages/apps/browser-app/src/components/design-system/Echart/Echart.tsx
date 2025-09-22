import { extractErrorDetails } from "@superego/shared-utils";
import * as echarts from "echarts";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import useTheme from "../../../business-logic/theme/useTheme.js";
import Alert from "../Alert/Alert.js";
import CodeBlock from "../CodeBlock/CodeBlock.js";
import getTheme from "./getTheme.js";

interface Props {
  option: echarts.EChartsOption;
  width: string;
  height: string;
  className?: string | undefined;
}
export default function Echart({ option, width, height, className }: Props) {
  const intl = useIntl();
  const [renderingError, setRenderingError] = useState<any>(null);
  const chartElementRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!chartElementRef.current) {
      return;
    }
    setRenderingError(null);
    const chart = echarts.init(chartElementRef.current, getTheme(theme));
    try {
      chart.setOption(option);
    } catch (error) {
      setRenderingError(error);
    }
    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartElementRef.current);
    return () => {
      chart.dispose();
      resizeObserver.disconnect();
    };
  }, [option, theme]);

  return renderingError === null ? (
    <div
      ref={chartElementRef}
      style={{ width, height }}
      className={className}
    />
  ) : (
    <Alert
      title={intl.formatMessage({
        defaultMessage: "An error occurred rendering the chart.",
      })}
      variant="error"
      style={{ width, height }}
    >
      <CodeBlock
        language="json"
        code={JSON.stringify(extractErrorDetails(renderingError), null, 2)}
      />
    </Alert>
  );
}
