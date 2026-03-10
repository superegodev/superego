import "maplibre-gl/dist/maplibre-gl.css";
import { extractErrorDetails } from "@superego/shared-utils";
import { useIntl } from "react-intl";
import Alert from "../Alert/Alert.js";
import CodeBlock from "../CodeBlock/CodeBlock.js";
import type Props from "./Props.js";
import useCreateMap from "./useCreateMap.js";

export default function EagerGeoJSONMap({
  geoJSON,
  width,
  height,
  className,
}: Props) {
  const intl = useIntl();
  const { mapContainerRef, renderingError } = useCreateMap(geoJSON);
  return renderingError === null ? (
    <div
      ref={mapContainerRef}
      style={{ width, height }}
      className={className}
    />
  ) : (
    <Alert
      title={intl.formatMessage({
        defaultMessage: "An error occurred rendering the map.",
      })}
      variant="error"
      style={{ width, height }}
    >
      <CodeBlock
        language="json"
        code={JSON.stringify(extractErrorDetails(renderingError))}
        showCopyButton={true}
      />
    </Alert>
  );
}
