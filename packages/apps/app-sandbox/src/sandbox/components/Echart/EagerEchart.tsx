import { extractErrorDetails } from "@superego/shared-utils";
import { getEchartsTheme } from "@superego/themes";
import * as echarts from "echarts";
import { useEffect, useRef, useState } from "react";
import useIntlMessages from "../../business-logic/intl-messages/useIntlMessages.js";
import useTheme from "../../business-logic/theme/useTheme.js";
import Alert from "../Alert/Alert.js";

interface Props {
  option: echarts.EChartsOption;
  width: string;
  height: string;
}
export default function Echart({ option, width, height }: Props) {
  const [renderingError, setRenderingError] = useState<any>(null);
  const chartElementRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const { renderingErrorAlertTitle } = useIntlMessages("Echart");

  useEffect(() => {
    if (!chartElementRef.current) {
      return;
    }
    setRenderingError(null);
    const chart = echarts.init(chartElementRef.current, getEchartsTheme(theme));
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
    <div ref={chartElementRef} style={{ width, height }} />
  ) : (
    <Alert title={renderingErrorAlertTitle} variant="error">
      <pre style={{ whiteSpace: "pre-wrap" }}>
        <code>
          {JSON.stringify(extractErrorDetails(renderingError), null, 2)}
        </code>
      </pre>
    </Alert>
  );
}
