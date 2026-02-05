import { DataType } from "@superego/schema";
import type { Control } from "react-hook-form";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "../../../../../test-utils.js";
import Markdown from "./Markdown.js";

function MarkdownWithForm({ defaultValue }: { defaultValue?: string | null }) {
  const { control } = useForm({
    defaultValues: { markdown: defaultValue ?? null },
  });
  return (
    <Markdown
      typeDefinition={{
        dataType: DataType.String,
        format: "dev.superego:String.Markdown",
      }}
      isNullable={true}
      isListItem={false}
      control={control as unknown as Control}
      name="markdown"
      label="Markdown field"
    />
  );
}

describe("Markdown", () => {
  it("renders the label", () => {
    // Exercise
    render(<MarkdownWithForm />);

    // Verify
    expect(screen.getByText("Markdown field")).toBeInTheDocument();
  });

  it("initializes the OverType editor", async () => {
    // Exercise
    const { container } = render(<MarkdownWithForm defaultValue="# Hello" />);

    // Verify
    await waitFor(() => {
      const textarea = container.querySelector("textarea");
      expect(textarea).toBeInTheDocument();
    });
  });

  it("sets the initial value in the editor", async () => {
    // Exercise
    const { container } = render(
      <MarkdownWithForm defaultValue="**bold text**" />,
    );

    // Verify
    await waitFor(() => {
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveValue("**bold text**");
    });
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
        />
      );
    }

    // Exercise
    render(<ListItemMarkdown />);

    // Verify
    expect(screen.queryByText("Markdown field")).not.toBeInTheDocument();
  });
});
