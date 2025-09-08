import { describe, expect, it, vi } from "vitest";
import { render } from "../../../test-utils.jsx";
import SendRecordToolbar from "./SendRecordToolbar.jsx";

describe("renders different buttons according to the supplied props", () => {
  interface TestCase {
    props: {
      areCompletionsConfigured: boolean;
      areTranscriptionsConfigured: boolean;
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
        areTranscriptionsConfigured: false,
        isWriting: false,
        isRecording: false,
      },
      expectedButtons: ["Configure assistant"],
    },
    {
      props: {
        areCompletionsConfigured: false,
        areTranscriptionsConfigured: true,
        isWriting: false,
        isRecording: false,
      },
      expectedButtons: ["Configure assistant"],
    },
    {
      props: {
        areCompletionsConfigured: true,
        areTranscriptionsConfigured: false,
        isWriting: false,
        isRecording: false,
      },
      expectedButtons: [
        "Configure assistant for transcription",
        "[DISABLED]Send",
      ],
    },
    {
      props: {
        areCompletionsConfigured: true,
        areTranscriptionsConfigured: false,
        isWriting: true,
        isRecording: false,
      },
      expectedButtons: ["Configure assistant for transcription", "Send"],
    },
    {
      props: {
        areCompletionsConfigured: true,
        areTranscriptionsConfigured: true,
        isWriting: true,
        isRecording: false,
      },
      expectedButtons: ["Send"],
    },
    {
      props: {
        areCompletionsConfigured: true,
        areTranscriptionsConfigured: true,
        isWriting: false,
        isRecording: false,
      },
      expectedButtons: ["Record"],
    },
    {
      props: {
        areCompletionsConfigured: true,
        areTranscriptionsConfigured: true,
        isWriting: false,
        isRecording: true,
      },
      expectedButtons: ["Cancel", "Finish and send"],
    },
  ];
  testCases.forEach(
    ({
      props: {
        areCompletionsConfigured,
        areTranscriptionsConfigured,
        isWriting,
        isRecording,
      },
      expectedButtons,
      only,
    }) => {
      const renderBoolean = (b: boolean) => String(b)[0];
      (only ? it.only : it)(
        [
          `acc=${renderBoolean(areCompletionsConfigured)},`,
          `atc=${renderBoolean(areTranscriptionsConfigured)},`,
          `iw=${renderBoolean(isWriting)},`,
          `ir=${renderBoolean(isRecording)},`,
          "->",
          ...expectedButtons.map((label) => `"${label}",`),
        ].join(" "),
        () => {
          // Exercise
          const component = render(
            <SendRecordToolbar
              isRecording={isRecording}
              isWriting={isWriting}
              areCompletionsConfigured={areCompletionsConfigured}
              areTranscriptionsConfigured={areTranscriptionsConfigured}
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
