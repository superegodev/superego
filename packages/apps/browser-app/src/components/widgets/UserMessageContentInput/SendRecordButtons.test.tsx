import { describe, expect, it, vi } from "vitest";
import { render } from "../../../test-utils.js";
import SendRecordButtons from "./SendRecordButtons.js";

describe("renders different buttons according to the supplied props", () => {
  interface TestCase {
    props: {
      areCompletionsConfigured: boolean;
      isWriting: boolean;
      isRecording: boolean;
    };
    expectedButtons: string[];
    only?: true | undefined;
  }
  const testCases: TestCase[] = [
    {
      props: {
        areCompletionsConfigured: false,
        isWriting: false,
        isRecording: false,
      },
      expectedButtons: ["Configure assistant"],
    },
    {
      props: {
        areCompletionsConfigured: true,
        isWriting: false,
        isRecording: false,
      },
      expectedButtons: ["Record"],
    },
    {
      props: {
        areCompletionsConfigured: true,
        isWriting: true,
        isRecording: false,
      },
      expectedButtons: ["Send"],
    },
    {
      props: {
        areCompletionsConfigured: true,
        isWriting: false,
        isRecording: true,
      },
      expectedButtons: ["Cancel", "Finish and send"],
    },
  ];
  testCases.forEach(
    ({
      props: { areCompletionsConfigured, isWriting, isRecording },
      expectedButtons,
      only,
    }) => {
      const renderBoolean = (b: boolean) => String(b)[0];
      (only ? it.only : it)(
        [
          `acc=${renderBoolean(areCompletionsConfigured)},`,
          `iw=${renderBoolean(isWriting)},`,
          `ir=${renderBoolean(isRecording)},`,
          "->",
          ...expectedButtons.map((label) => `"${label}",`),
        ].join(" "),
        () => {
          // Exercise
          const component = render(
            <SendRecordButtons
              isRecording={isRecording}
              isWriting={isWriting}
              isDisabled={false}
              areChatCompletionsConfigured={areCompletionsConfigured}
              onSend={vi.fn()}
              onStartRecording={vi.fn()}
              onFinishRecording={vi.fn()}
              onCancelRecording={vi.fn()}
            />,
          );
          const buttons = [
            ...component.queryAllByRole("button"),
            ...component.queryAllByRole("link"),
          ].map((element) =>
            [
              element.getAttribute("data-disabled") === "true"
                ? "[DISABLED]"
                : "",
              element.getAttribute("aria-label"),
            ].join(""),
          );

          // Verify
          expect(buttons.sort()).toEqual(expectedButtons.sort());
        },
      );
    },
  );
});
