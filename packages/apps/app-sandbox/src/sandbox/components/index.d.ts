import type * as echarts from "echarts";
import type { CSSProperties, ReactNode } from "react";

interface AlertProps {
  variant: "neutral" | "info" | "error";
  title?: string | undefined;
  children: ReactNode;
  style?: CSSProperties | undefined;
  className?: string | undefined;
}
export function Alert({
  variant,
  title,
  children,
  style,
  className,
}: AlertProps): import("react").JSX.Element;

interface EchartProps {
  option: echarts.EChartsOption;
  width: string;
  height: string;
  className?: string | undefined;
}
export function Echart({
  option,
  width,
  height,
  className,
}: EchartProps): import("react").JSX.Element;
