import { DataType, type JsonObjectTypeDefinition } from "@superego/schema";
import { fireEvent, render, screen } from "../../../../../test-utils.js";
import { useForm, useWatch } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import GeoJSON from "./GeoJSON.js";

const geoJsonInputSpy = vi.fn();

vi.mock("../../../../design-system/GeoJSONInput/GeoJSONInput.js", () => ({
  default: (props: { onChange?: (value: Record<string, unknown>) => void }) => {
    geoJsonInputSpy(props);
    return (
      <button
        type="button"
        onClick={() =>
          props.onChange?.({ type: "FeatureCollection", features: [] })
        }
      >
        Map input
      </button>
    );
  },
}));

describe("GeoJSON", () => {
  it("updates the form value when the map input changes", () => {
    // Setup mocks
    geoJsonInputSpy.mockClear();

    // Setup SUT
    const typeDefinition = {
      dataType: DataType.JsonObject,
      format: "geojson",
    } as JsonObjectTypeDefinition;
    const TestHarness = () => {
      const { control } = useForm({ defaultValues: { location: null } });
      const value = useWatch({ control, name: "location" });
      return (
        <>
          <GeoJSON
            typeDefinition={typeDefinition}
            isNullable={false}
            isListItem={false}
            control={control}
            name="location"
            label="Location"
          />
          <div data-testid="value">{JSON.stringify(value)}</div>
        </>
      );
    };

    render(<TestHarness />);

    // Exercise
    fireEvent.click(screen.getByRole("button", { name: "Map input" }));

    // Verify
    const nextValue = JSON.parse(
      screen.getByTestId("value").textContent ?? "",
    );
    expect(nextValue).toMatchObject({
      type: "FeatureCollection",
      __dataType: DataType.JsonObject,
    });
  });
});
