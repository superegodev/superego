import { DataType, FormatId } from "@superego/schema";
import { describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";
import { render, screen } from "../../../../test-utils.js";
import JsonObjectField from "./JsonObjectField.js";

vi.mock("./formats/ExcalidrawDrawing.js", () => ({
  default: () => <div data-testid="ExcalidrawDrawingFormat" />,
}));

function TestHarness({ format }: { format?: string }) {
  const { control } = useForm({
    defaultValues: {
      drawing: {
        __dataType: DataType.JsonObject,
      },
    },
  });
  return (
    <JsonObjectField
      typeDefinition={{ dataType: DataType.JsonObject, format }}
      isNullable={false}
      isListItem={false}
      control={control}
      name="drawing"
      label="Drawing"
    />
  );
}

describe("JsonObjectField", () => {
  it("renders ExcalidrawDrawing format when configured", () => {
    // Setup SUT
    const format = FormatId.JsonObject.ExcalidrawDrawing;

    // Exercise
    render(<TestHarness format={format} />);

    // Verify
    expect(screen.getByTestId("ExcalidrawDrawingFormat")).toBeInTheDocument();
  });
});
