import { echarts, getEchartsTheme } from "@superego/echarts";
import { extractErrorDetails } from "@superego/shared-utils";
import { useEffect, useRef, useState } from "react";
import useIntlMessages from "../../business-logic/intl-messages/useIntlMessages.js";
import useTheme from "../../business-logic/theme/useTheme.js";
import Alert from "../Alert/Alert.js";
import deepResolveCssVars from "./deepResolveCssVars.js";
import type Props from "./Props.js";

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
    const styles = getComputedStyle(chartElementRef.current);
    const resolvedOption = deepResolveCssVars(option, styles);
    const chart = echarts.init(chartElementRef.current, getEchartsTheme(theme));
    try {
      chart.setOption(resolvedOption);
    } catch (error) {
      // The error comes from initializing an external chart after the DOM commits.
      // oxlint-disable-next-line react/set-state-in-effect
      setRenderingError(error);
    }
    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartElementRef.current);
    return () => {
      chart.dispose();
      resizeObserver.disconnect();
    };
  }, [option, theme]);

  return (
    <>
      <div
        ref={chartElementRef}
        style={{
          width,
          height,
          display: renderingError !== null ? "none" : undefined,
        }}
      />
      {renderingError !== null && (
        <Alert title={renderingErrorAlertTitle} variant="error">
          <pre style={{ whiteSpace: "pre-wrap" }}>
            <code>
              {JSON.stringify(extractErrorDetails(renderingError), null, 2)}
            </code>
          </pre>
        </Alert>
      )}
    </>
  );
}
