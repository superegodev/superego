import type { TypescriptFile } from "@superego/backend";
import react_global_dts from "../../../../../node_modules/@types/react/global.d.ts?raw";
import react_index_dts from "../../../../../node_modules/@types/react/index.d.ts?raw";
import react_jsxRuntime_dts from "../../../../../node_modules/@types/react/jsx-runtime.d.ts?raw";
import echarts_charts_dts from "../../../../../node_modules/echarts/types/dist/charts.d.ts?raw";
import echarts_components_dts from "../../../../../node_modules/echarts/types/dist/components.d.ts?raw";
import echarts_core_dts from "../../../../../node_modules/echarts/types/dist/core.d.ts?raw";
import echarts_echarts_dts from "../../../../../node_modules/echarts/types/dist/echarts.d.ts?raw";
import echarts_features_dts from "../../../../../node_modules/echarts/types/dist/features.d.ts?raw";
import echarts_option_dts from "../../../../../node_modules/echarts/types/dist/option.d.ts?raw";
import echarts_renderers_dts from "../../../../../node_modules/echarts/types/dist/renderers.d.ts?raw";
import echarts_shared_dts from "../../../../../node_modules/echarts/types/dist/shared.d.ts?raw";
import superegoAppSandboxComponents_index_dts from "../sandbox/components/index.d.ts?raw";
import superegoAppSandboxHooks_index_dts from "../sandbox/hooks/index.d.ts?raw";
import superegoAppSandboxTheme_index_dts from "../sandbox/theme/index.d.ts?raw";

export default [
  // React
  {
    path: "/node_modules/react/index.d.ts",
    source: react_index_dts,
  },
  {
    path: "/node_modules/react/global.d.ts",
    source: react_global_dts,
  },
  {
    path: "/node_modules/react/jsx-runtime.d.ts",
    source: react_jsxRuntime_dts,
  },
  // Echarts
  {
    path: "/node_modules/echarts/charts.d.ts",
    source: echarts_charts_dts,
  },
  {
    path: "/node_modules/echarts/components.d.ts",
    source: echarts_components_dts,
  },
  {
    path: "/node_modules/echarts/core.d.ts",
    source: echarts_core_dts,
  },
  {
    // Note: we intentionally point this index path to echarts.d.ts
    path: "/node_modules/echarts/index.d.ts",
    source: echarts_echarts_dts,
  },
  {
    path: "/node_modules/echarts/features.d.ts",
    source: echarts_features_dts,
  },
  {
    path: "/node_modules/echarts/option.d.ts",
    source: echarts_option_dts,
  },
  {
    path: "/node_modules/echarts/renderers.d.ts",
    source: echarts_renderers_dts,
  },
  {
    path: "/node_modules/echarts/shared.d.ts",
    source: echarts_shared_dts,
  },
  // @superego/app-sandbox/components
  {
    path: "/node_modules/@superego/app-sandbox/components/index.d.ts",
    source: superegoAppSandboxComponents_index_dts,
  },
  // @superego/app-sandbox/hooks
  {
    path: "/node_modules/@superego/app-sandbox/hooks/index.d.ts",
    source: superegoAppSandboxHooks_index_dts,
  },
  // @superego/app-sandbox/theme
  {
    path: "/node_modules/@superego/app-sandbox/theme/index.d.ts",
    source: superegoAppSandboxTheme_index_dts,
  },
] satisfies TypescriptFile[];
