import { DataType } from "@superego/schema";
import type { FieldValues } from "react-hook-form";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { render } from "../../../../../test-utils.js";
import type ExcalidrawInputProps from "../../../../design-system/ExcalidrawInput/Props.js";
import ExcalidrawDrawing from "./ExcalidrawDrawing.js";

const excalidrawInputSpy = vi.fn();

vi.mock("../../../../design-system/ExcalidrawInput/ExcalidrawInput.js", () => ({
  default: (props: ExcalidrawInputProps) => {
    excalidrawInputSpy(props);
    return <div data-testid="ExcalidrawInput" />;
  },
}));

vi.mock("../../uiOptions.js", () => ({
  useUiOptions: () => ({ isReadOnly: true }),
}));

function TestHarness() {
  const { control } = useForm<FieldValues>({
    defaultValues: {
      drawing: {
        __dataType: DataType.JsonObject,
        elements: [],
        appState: {},
        files: {},
      },
    },
  });

  return (
    <ExcalidrawDrawing
      typeDefinition={{ dataType: DataType.JsonObject }}
      isNullable={false}
      isListItem={false}
      control={control}
      name="drawing"
      label="Drawing"
    />
  );
}

describe("ExcalidrawDrawing", () => {
  it("passes the drawing value without __dataType to ExcalidrawInput", () => {
    // Setup mocks
    excalidrawInputSpy.mockClear();

    // Setup SUT
    render(<TestHarness />);

    // Exercise
    const [props] = excalidrawInputSpy.mock.calls[0] ?? [];

    // Verify
    expect(props).toEqual(
      expect.objectContaining({
        isReadOnly: true,
        value: {
          elements: [],
          appState: {},
          files: {},
        },
      }),
    );
    expect(props.value).not.toHaveProperty("__dataType");
  });
});
