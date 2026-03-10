import type * as echarts from "echarts";

export default interface Props {
  option: echarts.EChartsOption;
  width: string;
  height: string;
  className?: string | undefined;
}
