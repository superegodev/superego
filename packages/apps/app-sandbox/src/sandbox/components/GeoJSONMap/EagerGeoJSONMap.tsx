import "maplibre-gl/dist/maplibre-gl.css";
import { extractErrorDetails } from "@superego/shared-utils";
import useIntlMessages from "../../business-logic/intl-messages/useIntlMessages.js";
import Alert from "../Alert/Alert.js";
import type Props from "./Props.js";
import useCreateMap from "./useCreateMap.js";

export default function EagerGeoJSONMap({ geoJSON, width, height }: Props) {
  const { renderingError, mapContainerRef } = useCreateMap(geoJSON);
  const { renderingErrorAlertTitle } = useIntlMessages("GeoJSONMap");
  return renderingError === null ? (
    <div ref={mapContainerRef} style={{ width, height }} />
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
