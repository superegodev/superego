import type { ToolResult } from "@superego/backend";
import { useMemo } from "react";
import { vars } from "../../../../themes.css.js";
import GeoJSONMap from "../../../design-system/GeoJSONMap/GeoJSONMap.js";
import * as cs from "./ToolResult.css.js";

interface Props {
  toolResult: ToolResult.CreateGeoJSONMap & {
    output: { success: true };
    artifacts: NonNullable<ToolResult.CreateGeoJSONMap["artifacts"]>;
  };
}
export default function CreateGeoJSONMap({ toolResult }: Props) {
  // geoJSON actual value (not ref) only changes when toolCallId changes.
  // Since we don't want to recreate the map on every change of ref, we memoize
  // the geoJSON.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  const geoJSON = useMemo(
    () => toolResult.artifacts.geoJSON,
    [toolResult.toolCallId],
  );
  return (
    <GeoJSONMap
      geoJSON={geoJSON}
      width="100%"
      height={vars.spacing._100}
      className={cs.CreateGeoJSONMap.root}
    />
  );
}
