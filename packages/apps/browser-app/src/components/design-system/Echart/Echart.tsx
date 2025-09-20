import { extractErrorDetails } from "@superego/shared-utils";
import * as echarts from "echarts";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import useTheme from "../../../business-logic/theme/useTheme.js";
import Alert from "../Alert/Alert.jsx";
import CodeBlock from "../CodeBlock/CodeBlock.jsx";
import getTheme from "./getTheme.js";

interface Props {
  option: echarts.EChartsOption;
  width: string;
  height: string;
}
export default function Echart({ option, width, height }: Props) {
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
    <div style={{ width, height }} ref={chartElementRef} />
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
