import { extractErrorDetails } from "@superego/shared-utils";
import * as echarts from "echarts";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import Alert from "../Alert/Alert.jsx";
import CodeBlock from "../CodeBlock/CodeBlock.jsx";

interface Props {
  option: echarts.EChartsOption;
  width: string;
  height: string;
}
export default function Echart({ option, width, height }: Props) {
  const intl = useIntl();
  const [renderingError, setRenderingError] = useState<any>(null);
  const chartElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartElementRef.current) {
      return;
    }
    const chart = echarts.init(chartElementRef.current);
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
  }, [option]);

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
