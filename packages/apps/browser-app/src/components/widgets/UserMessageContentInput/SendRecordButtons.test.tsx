import { describe, expect, it, vi } from "vitest";
import { render } from "../../../test-utils.js";
import SendRecordButtons from "./SendRecordButtons.js";

describe("renders different buttons according to the supplied props", () => {
  interface TestCase {
    props: {
      isCompletionConfigured: boolean;
      isTranscriptionConfigured: boolean;
      isWriting: boolean;
      isRecording: boolean;
    };
    expectedButtons: string[];
    only?: true | undefined;
  }
  const testCases: TestCase[] = [
    {
      props: {
        isCompletionConfigured: false,
        isTranscriptionConfigured: false,
        isWriting: false,
        isRecording: false,
      },
      expectedButtons: ["Configure assistant"],
    },
    {
      props: {
        isCompletionConfigured: false,
        isTranscriptionConfigured: true,
        isWriting: false,
        isRecording: false,
      },
      expectedButtons: ["Configure assistant"],
    },
    {
      props: {
        isCompletionConfigured: true,
        isTranscriptionConfigured: false,
        isWriting: false,
        isRecording: false,
      },
      expectedButtons: [
        "Add model w/ audio understanding to use voice",
        "[DISABLED]Send",
      ],
    },
    {
      props: {
        isCompletionConfigured: true,
        isTranscriptionConfigured: false,
        isWriting: true,
        isRecording: false,
      },
      expectedButtons: [
        "Add model w/ audio understanding to use voice",
        "Send",
      ],
    },
    {
      props: {
        isCompletionConfigured: true,
        isTranscriptionConfigured: true,
        isWriting: true,
        isRecording: false,
      },
      expectedButtons: ["Send"],
    },
    {
      props: {
        isCompletionConfigured: true,
        isTranscriptionConfigured: true,
        isWriting: false,
        isRecording: false,
      },
      expectedButtons: ["Speak"],
    },
    {
      props: {
        isCompletionConfigured: true,
        isTranscriptionConfigured: true,
        isWriting: false,
        isRecording: true,
      },
      expectedButtons: ["Cancel", "Finish and send"],
    },
  ];
  testCases.forEach(
    ({
      props: {
        isCompletionConfigured,
        isTranscriptionConfigured,
        isWriting,
        isRecording,
      },
      expectedButtons,
      only,
    }) => {
      const renderBoolean = (b: boolean) => String(b)[0];
      (only ? it.only : it)(
        [
          `icc=${renderBoolean(isCompletionConfigured)},`,
          `itc=${renderBoolean(isTranscriptionConfigured)},`,
          `iw=${renderBoolean(isWriting)},`,
          `ir=${renderBoolean(isRecording)},`,
          "->",
          ...expectedButtons.map((label) => `"${label}",`),
        ].join(" "),
        () => {
          // Exercise
          const component = render(
            <SendRecordButtons
              isCompletionConfigured={isCompletionConfigured}
              isTranscriptionConfigured={isTranscriptionConfigured}
              isRecording={isRecording}
              isWriting={isWriting}
              isDisabled={false}
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
