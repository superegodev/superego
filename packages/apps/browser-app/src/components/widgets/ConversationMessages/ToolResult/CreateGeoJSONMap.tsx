import type { ToolResult } from "@superego/backend";
import { lazy, Suspense, useMemo } from "react";
import { vars } from "../../../../themes.css.js";
import Skeleton from "../../../design-system/Skeleton/Skeleton.js";
import * as cs from "./ToolResult.css.js";

const GeoJSONMap = lazy(
  () => import("../../../design-system/GeoJSONMap/GeoJSONMap.js"),
);

interface Props {
  toolResult: ToolResult.CreateGeoJSONMap & {
    output: { success: true };
    artifacts: NonNullable<ToolResult.CreateGeoJSONMap["artifacts"]>;
  };
}
export default function CreateGeoJSONMap({ toolResult }: Props) {
  const { geoJSON } = toolResult.artifacts;

  // geoJSON actual value (not ref) only changes when toolCallId changes.
  // Since we don't want to recreate the map on every change of ref, we memoize
  // the geoJSON.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  const stableGeoJSON = useMemo(() => geoJSON, [toolResult.toolCallId]);

  return (
    <Suspense
      fallback={
        <Skeleton variant="rectangle" width="100%" height={vars.spacing._80} />
      }
    >
      <GeoJSONMap
        geoJSON={stableGeoJSON}
        width="100%"
        height={vars.spacing._80}
        className={cs.CreateGeoJSONMap.root}
      />
    </Suspense>
  );
}
