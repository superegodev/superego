import { DataType } from "@superego/schema";
import type { Control } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { describe, expect, it } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "../../../../../test-utils.js";
import Markdown from "./Markdown.js";

interface FormValues {
  markdown: string | null;
}

function MarkdownWithForm({
  defaultValue,
  isNullable = true,
  onValue,
}: {
  defaultValue?: string | null;
  isNullable?: boolean;
  onValue?: (value: string | null) => void;
}) {
  const { control } = useForm<FormValues>({
    defaultValues: { markdown: defaultValue ?? null },
  });
  return (
    <>
      <Markdown
        typeDefinition={{
          dataType: DataType.String,
          format: "dev.superego:String.Markdown",
        }}
        isNullable={isNullable}
        isListItem={false}
        control={control as unknown as Control}
        name="markdown"
        label="Markdown field"
        autoFocus={false}
      />
      {onValue ? <ValueProbe control={control} onValue={onValue} /> : null}
    </>
  );
}

function ValueProbe({
  control,
  onValue,
}: {
  control: Control<FormValues>;
  onValue: (value: string | null) => void;
}) {
  const value = useWatch({ control, name: "markdown" }) as string | null;
  onValue(value);
  return null;
}

describe("Markdown", () => {
  it("initializes the OverType editor", async () => {
    // Exercise
    const { container } = render(<MarkdownWithForm defaultValue="# Hello" />);

    // Verify
    await waitFor(() => {
      const textarea = container.querySelector("textarea");
      expect(textarea).toBeInTheDocument();
    });
  });

  it("renders the label when isListItem is false", () => {
    // Exercise
    render(<MarkdownWithForm />);

    // Verify
    expect(screen.getByText("Markdown field")).toBeInTheDocument();
  });

  it("does not render the label when isListItem is true", () => {
    // Setup SUT
    function ListItemMarkdown() {
      const { control } = useForm({
        defaultValues: { markdown: null },
      });
      return (
        <Markdown
          typeDefinition={{
            dataType: DataType.String,
            format: "dev.superego:String.Markdown",
          }}
          isNullable={true}
          isListItem={true}
          control={control as unknown as Control}
          name="markdown"
          label="Markdown field"
          autoFocus={false}
        />
      );
    }

    // Exercise
    render(<ListItemMarkdown />);

    // Verify
    expect(screen.queryByText("Markdown field")).not.toBeInTheDocument();
  });

  it("keeps an empty string as an empty string when the field is not nullable", async () => {
    // Setup SUT
    let latestValue: string | null = "unset";
    const { container } = render(
      <MarkdownWithForm
        defaultValue="hello"
        isNullable={false}
        onValue={(value) => {
          latestValue = value;
        }}
      />,
    );
    const textarea = await waitFor(() => {
      const element = container.querySelector("textarea");
      expect(element).toBeInTheDocument();
      return element!;
    });

    // Exercise
    fireEvent.input(textarea, { target: { value: "" } });

    // Verify
    await waitFor(() => {
      expect(latestValue).toBe("");
    });
  });

  it("converts an empty string to null when the field is nullable", async () => {
    // Setup SUT
    let latestValue: string | null = "unset";
    const { container } = render(
      <MarkdownWithForm
        defaultValue="hello"
        isNullable={true}
        onValue={(value) => {
          latestValue = value;
        }}
      />,
    );
    const textarea = await waitFor(() => {
      const element = container.querySelector("textarea");
      expect(element).toBeInTheDocument();
      return element!;
    });

    // Exercise
    fireEvent.input(textarea, { target: { value: "" } });

    // Verify
    await waitFor(() => {
      expect(latestValue).toBeNull();
    });
  });
});
