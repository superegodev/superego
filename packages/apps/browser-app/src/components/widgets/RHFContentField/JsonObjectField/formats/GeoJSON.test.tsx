import { DataType, FormatId } from "@superego/schema";
import type { Control } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "../../../../../test-utils.js";
import GeoJSON from "./GeoJSON.js";

vi.mock("../../../../design-system/GeoJSONInput/GeoJSONInput.js", () => ({
  default: ({ value }: { value: unknown }) => (
    <div data-testid="geojson-map" data-value={JSON.stringify(value)} />
  ),
}));

const geoJsonTypeDefinition = {
  dataType: DataType.JsonObject,
  format: FormatId.JsonObject.GeoJSON,
} as const;

function TestForm({ defaultValue }: { defaultValue: unknown }) {
  const { control } = useForm({ defaultValues: { geojson: defaultValue } });
  const currentValue = useWatch({ control, name: "geojson" });
  return (
    <>
      <GeoJSON
        typeDefinition={geoJsonTypeDefinition}
        isNullable={false}
        isListItem={false}
        control={control as unknown as Control}
        name="geojson"
        label="GeoJSON"
      />
      <pre data-testid="current-value">{JSON.stringify(currentValue)}</pre>
    </>
  );
}

describe("GeoJSON JsonObject format", () => {
  it("stores GeoJSON values with JsonObject branding", () => {
    // Setup SUT
    render(<TestForm defaultValue={null} />);

    const input = screen.getByLabelText(/GeoJSON/);
    const geoJsonValue = JSON.stringify({
      type: "FeatureCollection",
      features: [],
    });

    // Exercise
    fireEvent.change(input, { target: { value: geoJsonValue } });

    // Verify
    expect(screen.getByTestId("current-value")).toHaveTextContent("__dataType");
  });

  it("preserves invalid JSON input as a string", () => {
    // Setup SUT
    render(<TestForm defaultValue={null} />);

    const input = screen.getByLabelText(/GeoJSON/);

    // Exercise
    fireEvent.change(input, { target: { value: "{" } });

    // Verify
    expect(screen.getByTestId("current-value")).toHaveTextContent('"{"');
  });
});
